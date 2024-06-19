import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { Member } from './entities/member';
import { IMembersRepository } from './interfaces/members-repository.interface';
import { IMembersService } from './interfaces/members-service.interface';
import { CreateMemberDto } from './dto/create-member.dto';
import { TenantsMessage } from '../tenants/constants';
import { UsersMessage } from '../users';
import { Role } from '../roles/entities/role';
import { UpdateMemberDto } from './dto/update-member.dto';
import {
  FindOneOptions,
  IFindManyResponse,
  ServiceFindManyOptions,
  ServiceFindOneOptions,
  ServiceRequestContext,
} from '@w7t/multi-tenant/infra/interfaces';
import {
  AbilityAction,
  AbilityMessages,
  IAbilitiesService,
  SetAbilitiesContext,
  SetAbilitiesOptions,
} from '@w7t/multi-tenant/core/abilities';
import { CaslAbilitySubjects } from '@w7t/multi-tenant/infra/constants';
import { ENTITY_NAME_MEMBER, MembersMessage } from './constants';
import { IRolesService } from '../roles/interfaces/roles-service.interface';
import { Tenant } from '../tenants';

@Injectable()
export class MembersService implements IMembersService {
  constructor(
    @Inject(IMembersRepository) private readonly repo: IMembersRepository,
    @Inject(IRolesService) private readonly rolesService: IRolesService,
    @Inject(IAbilitiesService) private readonly abilities: IAbilitiesService,
  ) {
    this.abilities.configure(this.setAbilities);
  }

  async setAbilities(
    context: SetAbilitiesContext,
    { can, cannot }: SetAbilitiesOptions<CaslAbilitySubjects>,
  ): Promise<void> {
    const { user, tenant } = context || {};
    const { id: userId } = user || {};
    const { id: tenantId, members } = tenant || {};
    const [member] = members || [];
    const isMember = member?.id;
    const isOwner = member?.isOwner || false;
    // console.log(`MembersService.setAbilities:`, { isOwner, isMember, userId, tenantId })
    console.log(`MembersService.setAbilities: this:`, this);
    if (isOwner) {
      // console.log(`MembersService.setAbilities: allowing to manage`);
      can(AbilityAction.Manage, Member, { tenantId });
    } else if (isMember) {
      const permissions = this.abilities.getRelatedPermissions(
        member, ENTITY_NAME_MEMBER,
      );
      // console.log(`MembersService.setAbilities: permissions:`, permissions);
    } else {
      // not a member
    }
  }

  async create(
    body: CreateMemberDto,
    context: ServiceRequestContext,
  ): Promise<Member> {
    const { user, tenant: contextTenant, entityManager } = context || {};
    const { id: contextUserId } = user || {};
    const { id: contextTenantId } = contextTenant || {};
    let { tenantId, userId } = body || {};

    if (!contextUserId) {
      throw new InternalServerErrorException(UsersMessage.MISSING_CONTEXT_USER);
    }

    if (!userId) userId = contextUserId;
    if (!tenantId) tenantId = contextTenantId;

    if (!tenantId) {
      throw new InternalServerErrorException(TenantsMessage.MISSING_ID);
    }
    if (!userId) {
      throw new InternalServerErrorException(UsersMessage.MISSING_ID);
    }


    const payload = {
      ...body,
      roles: [],
    };

    const defaultRole = await this.rolesService.findOne({
      tenantId, isDefault: true,
    }, { tenant: { id: tenantId } as Tenant });
    if (defaultRole?.id) {
      if (contextTenantId) {
        await this.abilities.allow(AbilityAction.Create, Member, { user, tenant: contextTenant }, { roleId: defaultRole.id });
      }
      payload.roles = [{ id: defaultRole.id }];
    }
    return this.repo.create(payload, { entityManager });
  }

  async findMany(
    query: ServiceFindManyOptions<Member>,
    context?: ServiceRequestContext,
  ): Promise<IFindManyResponse<Member>> {
    const { user, tenant } = context || {};
    const { id: userId } = user || {};
    const { id: tenantId } = tenant || {};
    if (!tenantId) {
      throw new InternalServerErrorException(
        TenantsMessage.MISSING_CONTEXT_TENANT,
      );
    }
    if (!userId) {
      throw new InternalServerErrorException(UsersMessage.MISSING_CONTEXT_USER);
    }

    const finalQuery = this.repo.getFindManyOptions(query, { tenantId });
    const queryFilter = await this.abilities.getQueryFilter(
      AbilityAction.Read,
      Member,
      { user, tenant },
    );

    // console.log(`MembersService.findMany: queryFilter:`, queryFilter);

    if (queryFilter === false) {
      // nothing is allowed
      finalQuery.where = {
        tenantId,
        userId,
      };
    } else {
      if (Object.keys(queryFilter).length > 0) {
        // there are filters
        finalQuery.where = [
          {
            ...finalQuery.where,
            ...queryFilter,
          },
          {
            tenantId,
            userId,
          },
        ];
      }
    }
    // console.log(`MembersService.findMany: finalQuery:`, finalQuery);
    return this.repo.findMany(finalQuery);
  }

  async findOne(
    query: ServiceFindOneOptions<Member>,
    context: ServiceRequestContext,
  ): Promise<Member> {
    const { user, tenant } = context || {};
    const { id: userId } = user || {};
    const { id: tenantId } = tenant || {};
    // if (!tenantId) throw new InternalServerErrorException(TenantsMessage.MISSING_ID);
    if (!userId) {
      throw new InternalServerErrorException(UsersMessage.MISSING_CONTEXT_USER);
    }
    let finalQuery: FindOneOptions<Member>;
    if (tenantId) {
      finalQuery = this.repo.getFindOneOptions(query, { tenantId });
    } else {
      finalQuery = this.repo.getFindOneOptions(query, { userId });
    }

    const queryFilter = await this.abilities.getQueryFilter(
      AbilityAction.Read,
      Member,
      { user, tenant },
    );

    if (queryFilter === false) {
      // nothing is allowed
      finalQuery.where = {
        tenantId,
        userId,
      };
    } else {
      if (Object.keys(queryFilter).length > 0) {
        // there are filters
        finalQuery.where = [
          {
            ...finalQuery.where,
            ...queryFilter,
          },
          {
            tenantId,
            userId,
          },
        ];
      }
    }

    // await this.abilities.allow(AbilityAction.Read, Member, { user, tenant }, { userId });

    return this.repo.findOne(finalQuery);
  }

  async update(
    id: string | string[],
    payload: UpdateMemberDto,
    context: ServiceRequestContext,
  ): Promise<Member | Member[]> {
    const { user, tenant } = context || {};
    const { id: userId } = user || {};
    const { id: tenantId, members: contextMembers } = tenant || {};
    const [contextMember] = contextMembers || [];

    if (!userId) {
      throw new InternalServerErrorException(UsersMessage.MISSING_CONTEXT_USER);
    }
    if (!tenantId) {
      throw new InternalServerErrorException(TenantsMessage.MISSING_CONTEXT_TENANT);
    }

    const query = this.repo.getFindWhereByIds(id, { tenantId });

    const members = await this.repo.find({ where: query, relations: { roles: true } });
    console.log(`MembersService.update: members:`, members);

    let promises = [];
    if (members.length) {
      promises = members.map(async (member: Member) => {
        if (!contextMember?.isOwner) {
          if (member.roles.length) {
            await Promise.all((member.roles.map(async (role) => {
              await this.abilities.allow(
                AbilityAction.Update,
                Member,
                { user, tenant },
                { roleId: role.id, tenantId },
              );
            })));
          }
        }
        return this.updateMember(member, payload, context);
      });
    } else {
      throw new NotFoundException(MembersMessage.NOT_FOUND);
    }
    return await Promise.all(promises);
  }

  /**
   * Makes promise to update single member
   * @param member 
   * @param payload 
   * @param context 
   * @returns Promise
   */
  private async updateMember(
    member: Member,
    payload: UpdateMemberDto,
    context: ServiceRequestContext,
  ) {
    const { entityManager } = context || {};
    const { roles } = payload || {};
    if (Array.isArray(roles)) {
      member.roles = roles as Role[];
    }
    const result = await this.repo.save(member, { entityManager });
    console.log(`MembersService.updateMember: result:`, result);
    return result;
  }

  async remove(
    id: string | string[],
    context: ServiceRequestContext,
  ): Promise<Member | Member[]> {
    const { user, tenant, entityManager } = context || {};
    const { id: tenantId } = tenant || {};
    if (!tenantId) {
      throw new InternalServerErrorException(
        TenantsMessage.MISSING_CONTEXT_TENANT,
      );
    }

    console.log(`MembersService.remove: id:`, id);
    const query = this.repo.getFindWhereByIds(id, { tenantId });

    // await this.abilities.allow(
    //   AbilityAction.Delete,
    //   Member,
    //   { user, tenant },
    //   { tenantId },
    // );

    return this.repo.remove(query, { entityManager });
  }
}
