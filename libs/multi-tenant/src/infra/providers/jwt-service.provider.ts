import { IJwtService } from '@w7t/multi-tenant/app/auth/interfaces/jwt-service.interface';
import { JwtService } from '@nestjs/jwt';

export const JwtServiceProvider = {
  provide: IJwtService,
  useClass: JwtService,
};
