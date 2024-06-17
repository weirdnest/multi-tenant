import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import {
  AbstractRepository,
  AbstractRepositoryRequestParams,
} from '../abstract/abstract.repository';
import { Tenant } from '@w7t/multi-tenant/core/tenants/entities/tenant';
import { TenantEntity } from '@w7t/multi-tenant/app/entities/tenant.entity';

export class TenantsRepository extends AbstractRepository<Tenant> {
  constructor(
    @InjectRepository(TenantEntity)
    repository: Repository<Tenant>,
  ) {
    super(repository);
  }

  getRepository(params?: AbstractRepositoryRequestParams): Repository<Tenant> {
    const { entityManager } = params || {};
    if (entityManager) {
      return entityManager.getRepository(Tenant);
    }
    return this.repository;
  }
}
