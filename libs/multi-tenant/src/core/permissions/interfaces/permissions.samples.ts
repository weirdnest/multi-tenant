import { sampleRoleAdmin } from '../../roles/interfaces/roles.samples';
import { sampleTenant01 } from '../../tenants/interfaces/tenants.samples';

export const PermissionsSamples = {
  samplePermission01: {
    id: '9e74716f-c213-4794-b11c-90401deadfd4',
    tenantId: sampleTenant01.id,
    key: 'can-read-member-administrator',
    keyTenant:
      'can-read-member-administrator-91735b97-2e0b-4cb8-8adb-04bd213bc1da',
    name: '',
    description: 'Can read members with role: Administrator',
    action: 'read',
    target: { roles: { id: sampleRoleAdmin.id } },
    resource: 'Member',
    roleId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

export const { samplePermission01 } = PermissionsSamples;
