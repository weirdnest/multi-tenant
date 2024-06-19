import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ITenantsService } from './interfaces/tenants-service.interface';
import { Tenant } from './entities/tenant';

import { ITenantsRepository } from './interfaces/tenants-repository.interface';
import { User, UsersMessage } from '../users';
import { TenantsMessage } from './constants';
import * as slug from 'slug';
import { IMembersService } from '../members/interfaces/members-service.interface';
import { MembersMessage } from '../members/constants';
import { CreateTenantDto } from './dto/create-tenant.dto';
import {
  ServiceRequestContext,
  ServiceFindManyOptions,
  IFindManyResponse,
  ServiceFindOneOptions,
} from '@w7t/multi-tenant/infra';

@Injectable()
export class TenantsService implements ITenantsService {
  constructor(
    @Inject(ITenantsRepository) private readonly repo: ITenantsRepository,
    @Inject(IMembersService) private readonly membersService: IMembersService,
  ) { }

  /**
   * Creates tenant
   * @param body CreateTenantDto
   * @param context ServiceRequestContext
   * @returns Tenant
   * @throws ForbiddenException when tenant is available in context
   */
  async create(
    body: CreateTenantDto,
    context: ServiceRequestContext,
  ): Promise<Tenant> {
    const { user, tenant: currentTenant, entityManager } = context || {};
    const { id: userId } = user || {};
    const { id: currentTenantId } = currentTenant || {};
    const { name: tenantName } = body || {};

    if (!userId)
      throw new InternalServerErrorException(UsersMessage.MISSING_CONTEXT_USER);
    if (currentTenantId) {
      // not allowed when already logged as tenant member
      throw new ForbiddenException(TenantsMessage.NOT_ALLOWED_TO_CREATE_TENANT);
    }
    // validation is done before trimming, checking final result
    if (!tenantName)
      throw new BadRequestException([TenantsMessage.NAME_EMPTY_ERROR]);

    const tenantSlug = await this.createTenantSlug(tenantName);
    const tenant = await this.repo.create(
      {
        ...body,
        slug: tenantSlug,
      },
      { entityManager },
    );

    const { id: tenantId } = tenant || {};
    if (!tenantId)
      throw new InternalServerErrorException(TenantsMessage.FAILED_TO_CREATE);

    const member = await this.createOwnerMembership(user, tenant, context);
    const { id: memberId } = member || {};
    if (!memberId)
      throw new InternalServerErrorException(MembersMessage.FAILED_TO_CREATE);

    return {
      ...tenant,
      members: [member],
    };
  }

  /**
   * Generates unique slug
   * @param name string
   * @returns string
   */
  private async createTenantSlug(name: string) {
    let tenantSlug = slug(name);
    const isSlugInUse = await this.repo.findOne({ slug: tenantSlug });
    if (isSlugInUse?.id) {
      tenantSlug = `${tenantSlug}-${Math.round(Math.random() * 999999)}`;
    }
    return tenantSlug;
  }

  /**
   * Creates tenant membership for owner
   * @param user User
   * @param tenant Tenant
   * @returns Promise<Member>
   */
  private async createOwnerMembership(
    user: User,
    tenant: Tenant,
    context: ServiceRequestContext,
  ) {
    const { entityManager } = context || {};
    return await this.membersService.create(
      {
        name: user.name,
        email: user.email,
        tenantId: tenant.id,
        userId: user.id,
        isOwner: true,
      },
      { tenant, user, entityManager },
    );
  }

  /**
   * Finds list of tenants and total rows
   * @param query ServiceFindManyOptions<Tenant>
   * @param context ServiceRequestContext
   * @returns AbstractFindManyResponse<Tenant>
   */
  findMany(
    query: ServiceFindManyOptions<Tenant>,
    context: ServiceRequestContext,
  ): Promise<IFindManyResponse<Tenant>> {
    const { user, tenant } = context || {};
    const { id: userId } = user || {};
    if (!userId)
      throw new InternalServerErrorException(UsersMessage.MISSING_CONTEXT_USER);

    query = this.repo.getFindManyOptions(query);
    (query as any).where = {
      ...(query as any).where,
      // limiting list of tenants by user's memberships
      members: { userId },
    };
    return this.repo.findMany(query);
  }

  /**
   * Finds one row
   * @param query ServiceFindOneOptions<Tenant>
   * @param context ServiceRequestContext
   * @returns Tenant
   */
  findOne(
    query: ServiceFindOneOptions<Tenant>,
    context: ServiceRequestContext,
  ): Promise<Tenant> {
    const { user, tenant } = context || {};
    const { id: userId } = user || {};
    if (!userId)
      throw new InternalServerErrorException(UsersMessage.MISSING_CONTEXT_USER);

    return this.repo.findOne(query);
  }

  /**
   * Updates row(s)
   * @param id record id(s)
   * @param payload data to update
   * @param context service request context
   * @returns updated row(s)
   */
  update(
    id: string | string[],
    payload: Partial<Tenant>,
    context: ServiceRequestContext,
  ): Promise<Tenant | Tenant[]> {
    const { user, tenant } = context || {};
    const { id: userId } = user || {};
    if (!userId)
      throw new InternalServerErrorException(UsersMessage.MISSING_CONTEXT_USER);

    return this.repo.update(id, payload);
  }

  /**
   * Removes row(s)
   * @param id record id(s)
   * @param context service request context
   * @returns removed row(s) without id
   */
  remove(
    id: string | string[],
    context: ServiceRequestContext,
  ): Promise<Tenant | Tenant[]> {
    const { user, tenant } = context || {};
    const { id: userId } = user || {};
    if (!userId)
      throw new InternalServerErrorException(UsersMessage.MISSING_CONTEXT_USER);

    return this.repo.remove(id);
  }
}
