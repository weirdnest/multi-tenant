import { User } from './entities/user';
import { IUsersRepository } from './interfaces/users-repository.interface';
import { IUsersService } from './interfaces/users-service.interface';
import { Inject, Injectable } from '@nestjs/common';
import { ITenantsRepository } from '../tenants/interfaces/tenants-repository.interface';
import { ServiceFindManyOptions } from '@w7t/multi-tenant/infra/interfaces';

@Injectable()
export class UsersService implements IUsersService {
  constructor(
    @Inject(IUsersRepository)
    private repo: IUsersRepository,
  ) { }

  async create(body: Partial<User>) {
    return this.repo.create(body);
  }

  async findMany(query: ServiceFindManyOptions<User>): Promise<any> {
    return await this.repo.findMany(query);
  }

  async findOne(query: any): Promise<any> {
    return await this.repo.findOne(query);
  }

  update(
    id: string | string[],
    payload: Partial<User>,
  ): Promise<User | User[]> {
    return this.repo.update(id, payload);
  }

  remove(id: string | string[]): Promise<User | User[]> {
    return this.repo.remove(id);
  }
}
