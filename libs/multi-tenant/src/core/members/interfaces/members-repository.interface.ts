import { IRepository } from '@w7t/multi-tenant/infra/interfaces/repository.interface';
import { Member } from '../entities/member';

export type IMembersRepository = IRepository<Member>;

export const IMembersRepository = Symbol('IMembersRepository');
