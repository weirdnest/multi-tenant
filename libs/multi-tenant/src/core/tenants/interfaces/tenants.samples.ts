import { Tenant } from '../entities/tenant';

export const sampleTenantsData = {
  sampleTenant01: {
    id: '0c24fc94-2045-49be-a3cc-2849112129ee',
    name: 'Tenant 01',
    slug: 'tenant-01',
  } as Tenant,
};

export const { sampleTenant01 } = sampleTenantsData;
