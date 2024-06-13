import { ITenantsService, TenantsService } from "@w7t/multi-tenant/core/tenants";

export const TenantsServiceProvider = {
  provide: ITenantsService,
  useClass: TenantsService,
};
