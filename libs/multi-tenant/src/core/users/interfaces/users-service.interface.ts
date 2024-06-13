import { User } from '../entities/user';

export interface IUsersService {
  create(body: Partial<User>): Promise<User>;
  findMany(query: any): Promise<any>;
  findOne(query: any): Promise<User | undefined>;
}

export const IUsersService = Symbol('IUsersService');
