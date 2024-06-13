import { IRolesService } from "@w7t/multi-tenant/core/roles/interfaces/roles-service.interface";
import { RolesService } from "@w7t/multi-tenant/core/roles/roles.service";

export const RolesServiceProvider = {
  provide: IRolesService,
  useClass: RolesService,
};
