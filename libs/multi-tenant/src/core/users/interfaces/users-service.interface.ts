import { ServiceInterface } from '@w7t/multi-tenant/infra/interfaces/service.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user';

export type IUsersService = ServiceInterface<
  User,
  CreateUserDto,
  Partial<User>
>;

export const IUsersService = Symbol('IUsersService');
