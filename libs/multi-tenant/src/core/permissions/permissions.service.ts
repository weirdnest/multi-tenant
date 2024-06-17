import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { Permission } from './entities/permission';
import { Member } from '../members/entities/member';
import {
  ServiceRequestContext,
  ServiceFindManyOptions,
  AbstractFindManyResponse,
  ServiceFindOneOptions,
} from '@w7t/multi-tenant/infra';
import { TenantsMessage } from '../tenants/constants';
import { UsersMessage } from '../users';
import { PermissionsMessage, PERMISSIONS_UPSERT_LIMIT } from './constants';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { IPermissionsRepository } from './interfaces/permissions-repository.interface';
import { IPermissionsService } from './interfaces/permissions-service.interface';

@Injectable()
export class PermissionsService implements IPermissionsService {
  constructor(
    @Inject(IPermissionsRepository)
    private readonly repo: IPermissionsRepository, // @Inject(ICaslAbilityService) // private readonly abilities: ICaslAbilityService,
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
    // console.log(`PermissionsService.setAbilities:`, { isMember, isOwner, tenantId, userId });

    if (isOwner) {
      can(CaslAction.Manage, Permission, { tenantId });
    } else if (isMember) {
      can(CaslAction.Read, Permission, { tenantId });
    } else {
      // not a member, nothing is allowed
    }
  }
  */
  async findMemberPermissions(member: Member): Promise<Permission[]> {
    const { id: memberId, userId } = member || {};
    console.log(`findMemberPermissions:`, member);
    return await this.repo.find({
      where: {
        roles: {
          members: { id: memberId },
        },
      },
      relations: {
        roles: { members: true },
      },
    });
  }

  async create(
    body: Partial<Permission>,
    context: ServiceRequestContext,
  ): Promise<Permission> {
    const { user, tenant, entityManager } = context || {};
    const { id: userId } = user || {};
    const { id: tenantId } = tenant || {};
    if (!userId)
      throw new BadRequestException(UsersMessage.MISSING_CONTEXT_USER);
    if (!tenantId)
      throw new BadRequestException(TenantsMessage.MISSING_CONTEXT_TENANT);

    // console.log(`PermissionsService.create:`, { userId, tenantId, entityManager: !!entityManager })
    // await this.abilities.allow(
    //   CaslAction.Create,
    //   Permission,
    //   { user, tenant },
    //   { tenantId },
    // );

    const { key } = body || {};
    if (!key)
      throw new BadRequestException(PermissionsMessage.PERMISSION_KEY_MISSING);

    return this.repo.create(
      {
        ...body,
        tenantId,
        keyTenant: `${tenantId}-${key}`,
      },
      { entityManager },
    );
  }

  async findMany(
    query: ServiceFindManyOptions<Permission>,
    context: ServiceRequestContext,
  ): Promise<AbstractFindManyResponse<Permission>> {
    const { user, tenant } = context || {};
    const { id: userId } = user || {};
    const { id: tenantId } = tenant || {};
    if (!userId)
      throw new BadRequestException(UsersMessage.MISSING_CONTEXT_USER);
    if (!tenantId)
      throw new BadRequestException(TenantsMessage.MISSING_CONTEXT_TENANT);

    // await this.abilities.allow(CaslAction.Read, Permission, { user, tenant }, { tenantId });
    return await this.repo.findMany(query);
  }

  async findOne(
    query: ServiceFindOneOptions<Permission>,
    context: ServiceRequestContext,
  ): Promise<Permission> {
    const { user, tenant } = context || {};
    const { id: userId } = user || {};
    const { id: tenantId } = tenant || {};
    if (!userId)
      throw new BadRequestException(UsersMessage.MISSING_CONTEXT_USER);
    if (!tenantId)
      throw new BadRequestException(TenantsMessage.MISSING_CONTEXT_TENANT);

    // await this.abilities.allow(CaslAction.Read, Permission, { user, tenant }, { tenantId });
    return await this.repo.findOne(query);
  }

  async update(
    id: string | string[],
    payload: Partial<Permission>,
    context: ServiceRequestContext,
  ): Promise<Permission | Permission[]> {
    const { user, tenant } = context || {};
    const { id: userId } = user || {};
    const { id: tenantId } = tenant || {};
    if (!userId)
      throw new BadRequestException(UsersMessage.MISSING_CONTEXT_USER);
    if (!tenantId)
      throw new BadRequestException(TenantsMessage.MISSING_CONTEXT_TENANT);

    // await this.abilities.allow(
    //   CaslAction.Update,
    //   Permission,
    //   { user, tenant },
    //   { tenantId },
    // );
    return await this.repo.update(id, payload);
  }

  async remove(
    id: string | string[],
    context: ServiceRequestContext,
  ): Promise<Permission | Permission[]> {
    const { user, tenant } = context || {};
    const { id: userId } = user || {};
    const { id: tenantId } = tenant || {};
    if (!userId)
      throw new BadRequestException(UsersMessage.MISSING_CONTEXT_USER);
    if (!tenantId)
      throw new BadRequestException(TenantsMessage.MISSING_CONTEXT_TENANT);

    // await this.abilities.allow(
    //   CaslAction.Delete,
    //   Permission,
    //   { user, tenant },
    //   { tenantId },
    // );

    return await this.repo.remove(id);
  }

  async upsert(
    records: CreatePermissionDto[],
    context?: ServiceRequestContext,
  ): Promise<Permission[]> {
    const { user, tenant, entityManager } = context || {};
    const { id: userId } = user || {};
    const { id: tenantId } = tenant || {};
    if (!userId)
      throw new BadRequestException(UsersMessage.MISSING_CONTEXT_USER);
    if (!tenantId)
      throw new BadRequestException(TenantsMessage.MISSING_CONTEXT_TENANT);
    // await this.abilities.allow(CaslAction.Create, Permission, { user, tenant }, { tenantId });

    console.log(`PermissionsService.upsert: records:`, records);
    if (!Array.isArray(records)) records = [records];

    if (records.length > PERMISSIONS_UPSERT_LIMIT) {
      throw new BadRequestException(
        PermissionsMessage.PERMISSIONS_UPSERT_LIMIT_EXCEEDED,
      );
    }

    const results = await Promise.all(
      records.map((record) => {
        const keyTenant = `${record.key}-${tenantId}`;

        return this.repo.upsert(
          {
            ...record,
            tenantId,
            keyTenant,
          },
          ['keyTenant'],
          { entityManager },
        );
      }),
    );
    return results;
  }
}
