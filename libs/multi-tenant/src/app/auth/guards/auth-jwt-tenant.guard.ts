import {
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthJwtTenantGuard extends AuthGuard('jwt-tenant') {
  constructor() {
    // private moduleRef: ModuleRef, // @Inject(ILogger) private readonly logger: ILogger,
    super();
  }

  async onModuleInit() {
    // this._logger = await this.moduleRef.resolve<ILogger>(ILogger);
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const { id: userId, tenant } = user || {};
    const { id: tenantId } = tenant || {};
    // console.log(`AuthJwtTenant.canActivate:`, { userId, tenantId });
    if (!userId) {
      // this.logger.verbose(`User not found in context`);
      return false;
    }
    if (!tenantId) {
      // this.logger.verbose(`Tenant not found in context`);
      return false;
    }

    request.tenant = request.user.tenant;
    delete request.user.tenant;
    return super.canActivate(context);
  }
}
