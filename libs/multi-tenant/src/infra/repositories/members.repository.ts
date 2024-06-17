import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import {
  AbstractRepository,
  AbstractRepositoryRequestParams,
} from '../abstract/abstract.repository';
import { MemberEntity } from '@w7t/multi-tenant/app/entities/member.entity';

export class MembersRepository extends AbstractRepository<MemberEntity> {
  constructor(
    @InjectRepository(MemberEntity)
    repository: Repository<MemberEntity>,
  ) {
    super(repository);
  }

  getRepository(
    params?: AbstractRepositoryRequestParams,
  ): Repository<MemberEntity> {
    const { entityManager } = params || {};
    if (entityManager) {
      return entityManager.getRepository(MemberEntity);
    }
    return this.repository;
  }
}
