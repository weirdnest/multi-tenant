import { Member } from '../../members/entities/member';
import { Permission } from '../../permissions/entities/permission';
import { Tenant } from '../../tenants/entities/tenant';

export class Role {
  id: string;
  name: string;
  tenantId: string;
  slug: string;
  permissions?: Permission[];
  members?: Member[];
  tenant?: Tenant;
  icon: string;
  description: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
