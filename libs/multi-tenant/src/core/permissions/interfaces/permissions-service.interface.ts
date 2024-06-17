import { Permission } from '../entities/permission';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { Member } from '../../members/entities/member';
import {
  ServiceInterface,
  ServiceRequestContext,
} from '@w7t/multi-tenant/infra/interfaces/service.interface';

export interface IPermissionsService
  extends ServiceInterface<
    Permission,
    CreatePermissionDto,
    UpdatePermissionDto
  > {
  upsert(
    records: CreatePermissionDto[],
    context?: ServiceRequestContext,
  ): Promise<Permission[]>;

  findMemberPermissions(member: Member): Promise<Permission[]>;
}

export const IPermissionsService = Symbol('IPermissionsService');
