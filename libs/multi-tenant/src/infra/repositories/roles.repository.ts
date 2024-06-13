import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import {
  AbstractRepository,
  AbstractRepositoryRequestParams,
} from '../abstract/abstract.repository';
import { RoleEntity } from '@w7t/multi-tenant/app/entities/role.entity';
import { IRepository } from '../interfaces';

export class RolesRepository
  extends AbstractRepository<RoleEntity>
  implements IRepository<RoleEntity>
{
  constructor(
    @InjectRepository(RoleEntity)
    repository: Repository<RoleEntity>,
  ) {
    super(repository);
  }

  getRepository(
    params?: AbstractRepositoryRequestParams,
  ): Repository<RoleEntity> {
    const { entityManager } = params || {};
    if (entityManager) {
      return entityManager.getRepository(RoleEntity);
    }
    return this.repository;
  }
}
