import { Tenant } from '../entities/tenant';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto';
import { ServiceInterface } from '@w7t/multi-tenant/infra';

export type ITenantsService = ServiceInterface<
  Tenant,
  CreateTenantDto,
  UpdateTenantDto
>;

export const ITenantsService = Symbol('ITenantsService');
