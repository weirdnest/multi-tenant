import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import {
  AbstractRepository,
  AbstractRepositoryRequestParams,
} from '../abstract/abstract.repository';
import { PermissionEntity } from '@w7t/multi-tenant/app/entities/permission.entity';

export class PermissionsRepository extends AbstractRepository<PermissionEntity> {
  constructor(
    @InjectRepository(PermissionEntity)
    repository: Repository<PermissionEntity>,
  ) {
    super(repository);
  }

  getRepository(
    params?: AbstractRepositoryRequestParams,
  ): Repository<PermissionEntity> {
    const { entityManager } = params || {};
    if (entityManager) {
      return entityManager.getRepository(PermissionEntity);
    }
    return this.repository;
  }
}
