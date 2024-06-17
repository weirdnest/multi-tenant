import * as _ from 'lodash';
import * as slug from 'slug';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { Role } from './entities/role';
import {
  ServiceRequestContext,
  ServiceFindManyOptions,
  AbstractFindManyResponse,
  ServiceFindOneOptions,
} from '@w7t/multi-tenant/infra';
import { CreatePermissionDto } from '../permissions/dto/create-permission.dto';
import { Permission } from '../permissions/entities/permission';
import { IPermissionsService } from '../permissions/interfaces/permissions-service.interface';
import { TenantsMessage } from '../tenants/constants';
import { UsersMessage } from '../users';
import { RolesMessage } from './constants';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { IRolesRepository } from './interfaces/roles-repository.interface';
import { IRolesService } from './interfaces/roles-service.interface';
import { AbilityAction } from '../abilities';

@Injectable()
export class RolesService implements IRolesService {
  constructor(
    @Inject(IRolesRepository) private readonly repo: IRolesRepository,
    @Inject(IPermissionsService)
    private readonly permissionsService: IPermissionsService, // @Inject(ICaslAbilityService) // private readonly abilities: ICaslAbilityService,
  ) {
    // this.abilities.configure(this.setAbilities);
  }

  /*
  async setAbilities(
    context: SetAbilitiesContext,
    { can, cannot }: SetAbilitiesOptions<CaslAbilitySubjects>,
  ): Promise<void> {
    const { user, tenant } = context || {};
    const { id: userId } = user || {};
    const { id: tenantId, members } = tenant || {};
    const [member] = members || [];
    const isMember = member?.id;
    const isOwner = member?.isOwner;
    if (isOwner) {
      can(CaslAction.Manage, Role, { tenantId });
    } else if (isMember) {
      can(CaslAction.Read, Role, { tenantId });
    } else {
      // not a member, nothing is allowed
    }
  }
  */

  async create(body: CreateRoleDto, context: ServiceRequestContext) {
    const { user, tenant } = context || {};
    const { id: userId } = user || {};
    const { id: tenantId } = tenant || {};

    if (!userId)
      throw new InternalServerErrorException(UsersMessage.MISSING_CONTEXT_USER);
    if (!tenantId)
      throw new InternalServerErrorException(
        TenantsMessage.MISSING_CONTEXT_TENANT,
      );

    // await this.abilities.allow(
    //   CaslAction.Create,
    //   Role,
    //   { user, tenant },
    //   { tenantId },
    // );

    const roleName = _.trim(_.get(body, 'name', ''));
    if (!roleName) throw new BadRequestException(RolesMessage.EMPTY_ROLE_NAME);
    const roleSlug = slug(body.name);

    const foundBySlug = await this.repo.findOne({
      where: {
        slug: roleSlug,
        tenantId,
      },
    });
    if (foundBySlug) throw new ConflictException(RolesMessage.ALREADY_EXISTS);

    const role = await this.repo.create({
      ...body,
      slug: roleSlug,
      tenantId,
    });

    // creating permissions to handle members of this role
    const permissionsToUpsert = this.getRoleRelatedPermissions(role);
    await this.permissionsService.upsert(permissionsToUpsert, context);

    return role;
  }

  /**
   * Creates permissions to handle members of a new role
   * @param role CreateRoleDto
   * @param param { roleSlug, tenantId }
   * @returns CreatePermissionDto[]
   */
  private getRoleRelatedPermissions(role: Role): CreatePermissionDto[] {
    const roleId = role.id;
    const actionValues = [AbilityAction.Read, AbilityAction.Manage];
    const permissionsToUpsert = [];
    actionValues.map((action, index) => {
      permissionsToUpsert.push({
        key: `can_${action}_member_${role.slug}`,
        tenantId: role.tenantId,
        target: { roles: { id: roleId } },
        action,
        resource: 'Member',
        description: `Can ${action} members with role: ${role.name}`,
      });
    });
    return permissionsToUpsert;
  }

  async findMany(
    query: ServiceFindManyOptions<Role>,
    context: ServiceRequestContext,
  ): Promise<AbstractFindManyResponse<Role>> {
    const { user, tenant } = context || {};
    const { id: userId } = user || {};
    const { id: tenantId } = tenant || {};

    // await this.abilities.allow(CaslAction.Read, Role, { user, tenant }, { tenantId });
    query = this.repo.getFindManyOptions(query, { tenantId });
    return this.repo.findMany(query);
  }

  async findOne(
    query: ServiceFindOneOptions<Role>,
    context: ServiceRequestContext,
  ): Promise<Role> {
    const { user, tenant } = context || {};
    const { id: userId } = user || {};
    const { id: tenantId } = tenant || {};

    // await this.abilities.allow(CaslAction.Read, Role, { user, tenant }, { tenantId });
    query = this.repo.getFindOneOptions(query, { tenantId });

    return this.repo.findOne(query);
  }

  async update(
    id: string | string[],
    payload: UpdateRoleDto,
    context: ServiceRequestContext,
  ): Promise<Role | Role[]> {
    const { user, tenant, entityManager } = context || {};
    const { id: tenantId } = tenant || {};
    if (!tenantId)
      throw new InternalServerErrorException(
        TenantsMessage.MISSING_CONTEXT_TENANT,
      );

    // await this.abilities.allow(CaslAction.Update, Role, { user, tenant }, { tenantId });

    const query = this.repo.getFindWhereByIds(id, { tenantId });
    const roles = await this.repo.find(query);
    let promises = [];
    if (roles.length) {
      promises = roles.map((role: Role) => {
        return this.updateRole(role, payload, context);
      });
    }
    return await Promise.all(promises);
  }

  private async updateRole(
    role: Role,
    payload: UpdateRoleDto,
    context: ServiceRequestContext,
  ) {
    const { entityManager } = context || {};
    const { permissions } = payload || {};

    if (Array.isArray(permissions)) {
      role.permissions = permissions as Permission[];
    }
    return this.repo.save(role, { entityManager });
  }

  async remove(
    id: string | string[],
    context: ServiceRequestContext,
  ): Promise<Role | Role[]> {
    const { user, tenant, entityManager } = context || {};
    const { id: tenantId } = tenant || {};
    if (!tenantId) {
      throw new InternalServerErrorException(
        TenantsMessage.MISSING_CONTEXT_TENANT,
      );
    }
    // await this.abilities.allow(CaslAction.Delete, Role, { user, tenant }, { tenantId });

    const query = this.repo.getFindWhereByIds(id, { tenantId });
    return this.repo.remove(query, { entityManager });
  }
}
