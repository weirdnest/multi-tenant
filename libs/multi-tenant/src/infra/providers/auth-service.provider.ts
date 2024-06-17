import { AuthService, IAuthService } from '@w7t/multi-tenant/app/auth';

export const AuthServiceProvider = {
  provide: IAuthService,
  useClass: AuthService,
};
