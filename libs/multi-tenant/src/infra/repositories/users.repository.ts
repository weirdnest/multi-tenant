import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import {
  AbstractRepository,
  AbstractRepositoryRequestParams,
} from '../abstract/abstract.repository';
import { UserEntity } from '../../app/entities/user.entity';

export class UsersRepository extends AbstractRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    repository: Repository<UserEntity>,
  ) {
    super(repository);
  }

  getRepository(
    params?: AbstractRepositoryRequestParams,
  ): Repository<UserEntity> {
    const { entityManager } = params || {};
    if (entityManager) {
      return entityManager.getRepository(UserEntity);
    }
    return this.repository;
  }
}
