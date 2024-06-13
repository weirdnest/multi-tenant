// import { Tenant } from '@w7t/users-api/tenants';

import { Tenant } from '@w7t/multi-tenant/core/tenants';
import { User } from '@w7t/multi-tenant/core/users';
import type { Request } from 'express';

// import { Tenant } from '../../core/services/tenants/entities/tenant.';
import { EntityManager } from 'typeorm';
export interface RequestWithContext extends Request {
  user?: User;
  tenant?: Tenant;
  entityManager?: EntityManager;
}
