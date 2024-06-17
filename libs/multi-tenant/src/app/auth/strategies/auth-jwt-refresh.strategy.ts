import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { IAuthService, AuthJwtPayload } from '../interfaces';
import { ModuleRef } from '@nestjs/core';
import { IConfigService } from '@w7t/multi-tenant/infra/interfaces/config-service.interface';

@Injectable()
export class AuthJwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  // private authService: IAuthService;

  constructor(
    // private readonly moduleRef: ModuleRef,
    @Inject(IAuthService) private readonly authService: IAuthService,
    @Inject(IConfigService) private readonly configService: IConfigService,
  ) {
    const secret = configService.get('JWT_REFRESH_TOKEN_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          return request?.body?.refreshToken || request.cookies?.Refresh;
        },
      ]),
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }
  // async onModuleInit() {
  //   this.authService = await this.moduleRef.resolve(IAuthService);
  // }

  async validate(request: Request, payload: AuthJwtPayload) {
    return this.authService.validateTokenPayload(payload);
  }
}
