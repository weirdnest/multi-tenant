import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject, Injectable } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';
import { IAuthService } from '../interfaces/auth-service.interface';

import { AuthJwtPayload } from '../interfaces/auth-jwt-payload.interface';
import { IConfigService } from '@w7t/multi-tenant/infra/interfaces';

@Injectable()
export class AuthTenantStrategy extends PassportStrategy(
  Strategy,
  'jwt-tenant',
) {
  constructor(
    @Inject(IAuthService) private readonly authService: IAuthService,
    @Inject(IConfigService) private readonly configService: IConfigService,
  ) {
    const secret = configService.get('JWT_ACCESS_TOKEN_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          return (request?.headers?.authorization || 'Bearer').split(' ').pop();
        },
      ]),
      secretOrKey: secret,
    });
  }

  async validate(payload: AuthJwtPayload) {
    const user = await this.authService.validateTokenPayload(payload);
    return (user as any)?.tenant?.id ? user : false;
  }
}
