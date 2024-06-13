import { IRepository } from '@w7t/multi-tenant/infra/interfaces/repository.interface';
import { Role } from '../entities/role';


export type IRolesRepository = IRepository<Role>;

export const IRolesRepository = Symbol('IRolesRepository');
