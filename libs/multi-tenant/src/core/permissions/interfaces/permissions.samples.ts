import { ENTITY_NAME_MEMBER } from '../../members/constants';
import { sampleRoleAdmin, sampleRoleMember } from '../../roles/interfaces/roles.samples';
import { sampleTenant01 } from '../../tenants/interfaces/tenants.samples';

export const PermissionsSamples = {
  samplePermissionCanReadAdmin: {
    id: '9e74716f-c213-4794-b11c-90401deadfd4',
    tenantId: sampleTenant01.id,
    key: 'can-read-member-administrator',
    keyTenant:
      'can-read-member-administrator-91735b97-2e0b-4cb8-8adb-04bd213bc1da',
    name: 'Can view administrators',
    description: 'Can read members with role: Administrator',
    action: 'read',
    query: { roles: { id: sampleRoleMember.id } },
    target: { roleId: sampleRoleAdmin.id },
    resource: 'Member',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  samplePermissionCanReadMember: {
    id: '9e74716f-c213-4794-b11c-90401deadfd3',
    tenantId: sampleTenant01.id,
    key: 'can-read-member-member',
    keyTenant:
      'can-read-member-member-91735b97-2e0b-4cb8-8adb-04bd213bc1da',
    name: 'Can view members',
    description: 'Can read members with role: Member',
    action: 'read',
    query: { roles: { id: sampleRoleMember.id } },
    target: { roleId: sampleRoleMember.id },
    resource: ENTITY_NAME_MEMBER,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  samplePermissionCanManageMember: {
    id: '9e74716f-c213-4794-b11c-90401deadfd5',
    tenantId: sampleTenant01.id,
    key: 'can-manage-member-member',
    keyTenant:
      'can-manage-member-member-91735b97-2e0b-4cb8-8adb-04bd213bc1da',
    name: 'Can manage members',
    description: 'Can manage members with role: Member',
    action: 'manage',
    query: { roles: { id: sampleRoleMember.id } },
    target: { roleId: sampleRoleMember.id },
    resource: ENTITY_NAME_MEMBER,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

export const {
  samplePermissionCanReadAdmin,
  samplePermissionCanReadMember,
  samplePermissionCanManageMember,
} = PermissionsSamples;
