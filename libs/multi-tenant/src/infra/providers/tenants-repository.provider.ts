import { ITenantsRepository } from '@w7t/multi-tenant/core/tenants/interfaces/tenants-repository.interface';
import { TenantsRepository } from '../repositories/tenants.repository';


export const TenantsRepositoryProvider = {
  provide: ITenantsRepository,
  useClass: TenantsRepository,
};
