import { IPermissionsRepository } from '@w7t/multi-tenant/core/permissions/interfaces/permissions-repository.interface';
import { PermissionsRepository } from '../repositories/permissions.repository';

export const PermissionsRepositoryProvider = {
  provide: IPermissionsRepository,
  useClass: PermissionsRepository,
};
