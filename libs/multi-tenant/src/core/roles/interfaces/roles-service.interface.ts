import { Role } from '../entities/role';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { ServiceInterface } from '@w7t/multi-tenant/infra/interfaces';

export type IRolesService = ServiceInterface<
  Role,
  CreateRoleDto,
  UpdateRoleDto
>;

export const IRolesService = Symbol('IRolesService');
