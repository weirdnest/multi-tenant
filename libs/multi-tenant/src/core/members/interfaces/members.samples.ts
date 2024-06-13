import { sampleTenant01 } from '../../tenants/interfaces/tenants.samples';
import { johnDoe } from '../../users/interfaces/users.samples';

export const SampleMembersData = {
  sampleMember01: {
    id: '0241e35b-73e7-46f4-84de-de6fede3f896',
    name: johnDoe.name,
    email: johnDoe.email,
    tenantId: sampleTenant01.id,
    userId: johnDoe.id,
    isOwner: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

export const { sampleMember01 } = SampleMembersData;
