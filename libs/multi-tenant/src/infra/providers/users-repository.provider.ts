import { IUsersRepository } from '@w7t/multi-tenant/core/users/interfaces';
import { UsersRepository } from '../repositories/users.repository';

export const UsersRepositoryProvider = {
  provide: IUsersRepository,
  useClass: UsersRepository,
};
