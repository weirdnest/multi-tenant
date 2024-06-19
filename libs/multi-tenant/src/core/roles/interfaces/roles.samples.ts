import { sampleTenant01 } from '../../tenants/interfaces/tenants.samples';
import { Role } from '../entities/role';

export const RolesSamples = {
  sampleRoleAdmin: {
    id: '0c24fc94-2045-49be-a3cc-2849112129ee',
    tenantId: sampleTenant01.id,
    slug: 'administrator',
    name: 'Administrator',
    isDefault: false,
  } as Role,
  sampleRoleMember: {
    id: '0c24fc94-2045-49be-a3cc-2849112130aa',
    tenantId: sampleTenant01.id,
    slug: 'member',
    name: 'Member',
    isDefault: true,
  } as Role,
};

export const { sampleRoleAdmin, sampleRoleMember } = RolesSamples;
