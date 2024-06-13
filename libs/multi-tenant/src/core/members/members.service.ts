import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { Member } from './entities/member';
import { IMembersRepository } from './interfaces/members-repository.interface';
import { IMembersService } from './interfaces/members-service.interface';
import { CreateMemberDto } from './dto/create-member.dto';
import { TenantsMessage } from '../tenants/constants';
import { UsersMessage } from '../users';
import { Role } from '../roles/entities/role';
import { UpdateMemberDto } from './dto/update-member.dto';
import { AbstractFindManyResponse, ServiceFindManyOptions, ServiceFindOneOptions, ServiceRequestContext } from '@w7t/multi-tenant/infra/interfaces';
import { AbilityAction, IAbilitiesService, SetAbilitiesContext, SetAbilitiesOptions } from '@w7t/multi-tenant/core/abilities'
import { CaslAbilitySubjects } from '@w7t/multi-tenant/infra/constants';

@Injectable()
export class MembersService implements IMembersService {
  constructor(
    @Inject(IMembersRepository) private readonly repo: IMembersRepository,
    @Inject(IAbilitiesService) private readonly abilities: IAbilitiesService,
    // private readonly abilities: AbilityService,
    // private readonly abilities: ICaslAbilityService,
    // @Inject(ICaslAbilityService)
    // private readonly abilities: ICaslAbilityService,
    // private readonly abilities: CaslAbilityService<any>,
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
    const isOwner = member?.isOwner;
    // await this.loadPermissions({ tenant });

    if (isOwner) {
      can(AbilityAction.Manage, Member, { tenantId });
    } else if (isMember) {
      can(AbilityAction.Read, Member, { tenantId });
      can(AbilityAction.Read, Member, { userId });
    } else {
      // not a member
    }
  }


  async create(
    body: CreateMemberDto,
    context: ServiceRequestContext,
  ): Promise<Member> {
    const { user, tenant, entityManager } = context || {};
    const { tenantId, userId } = body || {};
    if (!tenantId)
      throw new InternalServerErrorException(TenantsMessage.MISSING_ID);
    if (!userId)
      throw new InternalServerErrorException(UsersMessage.MISSING_CONTEXT_USER);

    // await this.abilities.allow(AbilityAction.Create, Member, { user, tenant }, { userId });
    return this.repo.create(body, { entityManager });
  }

  async findMany(
    query: ServiceFindManyOptions<Member>,
    context?: ServiceRequestContext,
  ): Promise<AbstractFindManyResponse<Member>> {
    const { user, tenant } = context || {};
    const { id: userId } = user || {};
    const { id: tenantId } = tenant || {};
    if (!tenantId)
      throw new InternalServerErrorException(
        TenantsMessage.MISSING_CONTEXT_TENANT,
      );
    if (!userId)
      throw new InternalServerErrorException(UsersMessage.MISSING_CONTEXT_USER);

    console.log(`MembersService.findMany: member:`, tenant.members[0]);

    const finalQuery = this.repo.getFindManyOptions(query, { tenantId });
    const queryFilter = await this.abilities.getQueryFilter(
      query,
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

    console.log(
      `MembersService.findMany: user: ${user?.name}, finalQuery:`,
      finalQuery,
    );
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
    if (!userId)
      throw new InternalServerErrorException(UsersMessage.MISSING_CONTEXT_USER);

    // await this.abilities.allow(AbilityAction.Read, Member, { user, tenant }, { userId });

    return this.repo.findOne(query);
  }

  async update(
    id: string | string[],
    payload: UpdateMemberDto,
    context: ServiceRequestContext,
  ): Promise<Member | Member[]> {
    const { user, tenant } = context || {};
    const { id: tenantId } = tenant || {};
    if (!tenantId)
      throw new InternalServerErrorException(
        TenantsMessage.MISSING_CONTEXT_TENANT,
      );
    // await this.abilities.allow(
    //   AbilityAction.Update,
    //   Member,
    //   { user, tenant },
    //   { tenantId },
    // );

    const query = this.repo.getFindWhereByIds(id, { tenantId });
    const members = await this.repo.find(query);
    let promises = [];
    if (members.length) {
      promises = members.map((member: Member) => {
        return this.updateMember(member, payload, context);
      });
    }
    return await Promise.all(promises);
  }

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
    return this.repo.save(member, { entityManager });
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
    // await this.abilities.allow(
    //   AbilityAction.Delete,
    //   Member,
    //   { user, tenant },
    //   { tenantId },
    // );

    return this.repo.remove(id, { entityManager });
  }
}
