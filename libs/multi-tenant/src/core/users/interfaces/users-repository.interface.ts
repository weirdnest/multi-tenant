import { AbstractRepository } from '@w7t/multi-tenant/infra/abstract';
import { User } from '../entities/user';

export type IUsersRepository = AbstractRepository<User>;

export const IUsersRepository = Symbol('IUsersRepository');
