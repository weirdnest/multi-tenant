import { Tenant } from '../entities/tenant';

export const sampleTenantsData = {
  sampleTenant01: {
    id: '0c24fc94-2045-49be-a3cc-2849112129ee',
    name: 'Tenant 01',
    slug: 'tenant-01',
  } as Tenant,
  sampleTenant02: {
    id: 'eccc402f-6db1-4893-a32d-39168a5c4b30',
    name: 'Tenant 02',
    slug: 'tenant-02',
  } as Tenant,
};

export const { sampleTenant01, sampleTenant02 } = sampleTenantsData;
