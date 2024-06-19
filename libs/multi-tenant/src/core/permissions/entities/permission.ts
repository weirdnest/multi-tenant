import { Role } from '../../roles/entities/role';
import { Tenant } from '../../tenants/entities/tenant';

export class Permission {
  id: string;
  tenantId: string;
  key: string;
  keyTenant: string;
  name?: string;
  description?: string;
  action?: string;
  resource?: string;
  tenant?: Tenant;
  target?: Record<string, string | number | boolean>;
  query?: any;

  roles?: Role[];

  createdAt: Date;
  updatedAt: Date;
}
