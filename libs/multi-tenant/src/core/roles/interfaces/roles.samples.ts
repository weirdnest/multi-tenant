import { sampleTenant01 } from '../../tenants/interfaces/tenants.samples';

export const RolesSamples = {
  sampleRoleAdmin: {
    id: '0c24fc94-2045-49be-a3cc-2849112129ee',
    tenantId: sampleTenant01.id,
    slug: 'administrator',
    name: 'Administrator',
  },
  sampleRoleMember: {
    id: '0c24fc94-2045-49be-a3cc-2849112130aa',
    tenantId: sampleTenant01.id,
    slug: 'member',
    name: 'Member',
  },
};

export const { sampleRoleAdmin, sampleRoleMember } = RolesSamples;
