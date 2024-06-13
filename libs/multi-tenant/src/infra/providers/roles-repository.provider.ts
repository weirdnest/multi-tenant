import { IRolesRepository } from "@w7t/multi-tenant/core/roles/interfaces/roles-repository.interface";
import { RolesRepository } from "../repositories";

export const RolesRepositoryProvider = {
  provide: IRolesRepository,
  useClass: RolesRepository,
};
