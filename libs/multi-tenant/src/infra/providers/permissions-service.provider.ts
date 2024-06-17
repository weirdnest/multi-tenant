import { IPermissionsService } from '@w7t/multi-tenant/core/permissions/interfaces/permissions-service.interface';
import { PermissionsService } from '@w7t/multi-tenant/core/permissions/permissions.service';

export const PermissionsServiceProvider = {
  provide: IPermissionsService,
  useClass: PermissionsService,
};
