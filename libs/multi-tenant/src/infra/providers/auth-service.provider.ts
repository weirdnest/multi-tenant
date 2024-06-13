import { AuthService, IAuthService } from "@w7t/multi-tenant/core/auth";

export const AuthServiceProvider = {
  provide: IAuthService,
  useClass: AuthService,
};
