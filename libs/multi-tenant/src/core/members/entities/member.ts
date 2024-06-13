import { Role } from '../../roles/entities/role';
import { Tenant } from '../../tenants/entities/tenant';
import { User } from '../../users';

export class Member {
  id: string;
  name?: string;
  email?: string;
  tenantId: string;
  userId: string;
  isOwner: boolean;
  createdAt: Date;
  updatedAt: Date;

  tenant?: Tenant;
  user?: User;
  roles?: Role[];
}
