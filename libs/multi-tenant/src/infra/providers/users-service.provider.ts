import { IUsersService, UsersService } from '@w7t/multi-tenant/core/users';

export const UsersServiceProvider = {
  provide: IUsersService,
  useClass: UsersService,
};
