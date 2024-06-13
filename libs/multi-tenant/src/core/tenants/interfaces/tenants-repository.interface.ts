import { AbstractRepository } from '@w7t/multi-tenant/infra/abstract';
import { Tenant } from '../entities/tenant';

export type ITenantsRepository = AbstractRepository<Tenant>;

export const ITenantsRepository = Symbol('ITenantsRepository');
