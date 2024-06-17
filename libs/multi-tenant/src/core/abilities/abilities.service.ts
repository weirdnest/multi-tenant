import {
  AnyAbility,
  MongoAbility,
  MongoQuery,
  AbilityBuilder,
} from '@casl/ability';
import {
  Injectable,
  Scope,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ServiceRequestContext,
  ServiceFindManyOptions,
} from '@w7t/multi-tenant/infra';
import { Member } from '../members/entities/member';
import { Permission } from '../permissions/entities/permission';
import {
  AbilityAction,
  AbilityActionValue,
  AbilityMessages,
} from './constants';
import {
  IAbilitiesService,
  SetAbilitiesContext,
  SetAbilitiesOptions,
} from './interfaces';
import { IAbilityFactory } from './interfaces/ability-factory.interface';

@Injectable({ scope: Scope.TRANSIENT })
export class AbilitiesService<T extends AnyAbility>
  implements IAbilitiesService
{
  private _context: ServiceRequestContext;
  public get context() {
    return this._context;
  }
  public configure(
    setAbilities: (
      context: SetAbilitiesContext,
      opts: SetAbilitiesOptions<T>,
    ) => Promise<void>,
  ) {
    this._setAbilities = setAbilities;
  }

  private _key = String(Math.round(Math.random() * 9999));
  public get key() {
    return this._key;
  }

  constructor(
    @Inject(IAbilityFactory)
    private readonly abilityFactory: IAbilityFactory<T>,
  ) { }

  private _ability: undefined | MongoAbility<[AbilityAction, T], MongoQuery>;
  public get ability() {
    return this._ability;
  }

  private _builder: AbilityBuilder<
    MongoAbility<[AbilityAction, T], MongoQuery>
  >;
  public get builder() {
    return this._builder;
  }

  private _setAbilities: (
    context: SetAbilitiesContext,
    opts: SetAbilitiesOptions<T>,
  ) => Promise<void>;
  public get setAbilities() {
    return this._setAbilities;
  }

  public async createAbility(
    context: SetAbilitiesContext,
    classConstructor: T,
    setAbilities: (
      context: SetAbilitiesContext,
      opts: SetAbilitiesOptions<T>,
    ) => Promise<void>,
  ) {
    if (this.ability) return this.ability;
    const { user, tenant } = context || {};
    this._setAbilities = setAbilities;
    this._builder = this.abilityFactory.createBuilder(user);

    await this.setAbilities(context, this.builder);
    this._ability = this.abilityFactory.build();
    return this.ability;
  }

  private getRelatedPermissions(member: Member, classConstructorName: string) {
    const { id: memberId, roles } = member || {};
    if (!memberId) return [];

    const permissions: Permission[] = [];
    const collectedPermissionsKeys: Record<string, boolean> = {};

    if (Array.isArray(roles)) {
      roles.forEach((role) => {
        const { permissions: rolePermissions } = role || {};
        if (Array.isArray(rolePermissions)) {
          rolePermissions.forEach((permission) => {
            // console.log(`CaslAbilityService.getRelatedPermissions:`, permission);

            // filtering permissions related to resource
            if (permission.resource === classConstructorName) {
              // avoiding duplicates
              if (!collectedPermissionsKeys[permission.key]) {
                collectedPermissionsKeys[permission.key] = true;
                permissions.push(permission);
              }
            }
          });
        }
      });
    }
    return permissions;
  }

  async getQueryFilter(
    query: ServiceFindManyOptions<unknown>,
    actions: AbilityAction | AbilityActionValue[],
    classConstructor: any,
    context: SetAbilitiesContext,
  ) {
    const { user, tenant } = context || {};
    const condition = new classConstructor();
    const [member] = tenant?.members || [];
    const { id: memberId, isOwner, roles = [] } = member || {};
    const filter: any = {};

    if (isOwner) return true;

    const permissions = this.getRelatedPermissions(
      member,
      condition.constructor.name,
    );
    // console.log(`CaslAbilityService.getQueryFilter: user: ${user?.name}, roles: ${roles?.length}, permissions: ${permissions?.length}, roles:`, roles.map((role) => role.slug));

    permissions.forEach((permission) => {
      const { target, action: permittedAction } = permission || {};
      // console.log(`CaslAbilityService.getQueryFilter: permittedAction: ${permittedAction}, actions:`, actions);
      if (
        permittedAction === AbilityAction.Manage ||
        actions === permittedAction ||
        (Array.isArray(actions) &&
          actions.indexOf(permittedAction as AbilityAction) !== -1)
      ) {
        Object.keys(target).forEach((targetKey) => {
          // console.log(`CaslAbilityService.getQueryFilter: targetKey:`, targetKey, `, value:`, target[targetKey]);
          if (target[targetKey]) {
            if (Array.isArray(filter[targetKey])) {
              filter[targetKey].push(target[targetKey]);
            } else {
              filter[targetKey] = filter[targetKey] ? [filter[targetKey]] : [];
              filter[targetKey].push(target[targetKey]);
            }
          } else {
            filter[targetKey] = target[targetKey];
          }
        });
      }
    });

    if (Object.keys(filter).length === 0) {
      // no permissions are found
      return false;
      // throw new ForbiddenException(AbilitiesMessage.FORBIDDEN);
    }
    return filter;
  }

  async allow(
    actions: AbilityAction | AbilityActionValue[],
    classConstructor: any,
    context: SetAbilitiesContext,
    payload: Partial<unknown> = {},
  ) {
    const { user, tenant } = context || {};
    const ability = await this.createAbility(
      context,
      classConstructor,
      this.setAbilities,
    );
    const condition = new classConstructor();

    const [member] = tenant?.members || [];
    const permissions = this.getRelatedPermissions(
      member,
      condition.constructor.name,
    );

    // console.log(`CaslAbilityService.allow: permissions:`, permissions);

    Object.keys(payload).forEach((key) => {
      condition[key] = payload[key];
    });

    if (!Array.isArray(actions)) {
      actions = [actions];
    }

    actions.forEach((action) => {
      if (!ability.can(action as AbilityAction, condition as T)) {
        throw new HttpException(
          AbilityMessages.FORBIDDEN,
          HttpStatus.FORBIDDEN,
        );
      }
    });
  }
}
