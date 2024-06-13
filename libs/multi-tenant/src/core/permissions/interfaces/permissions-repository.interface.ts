import { IRepository } from '@w7t/multi-tenant/infra/interfaces/repository.interface';
import { Permission } from '../entities/permission';


export type IPermissionsRepository = IRepository<Permission>;

export const IPermissionsRepository = Symbol('IPermissionsRepository');
