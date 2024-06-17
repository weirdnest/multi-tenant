import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { IAuthService, AuthJwtPayload } from '../interfaces';
// import { ModuleRef } from '@nestjs/core';
import { IConfigService } from '../../../infra/interfaces';

@Injectable()
export class AuthJwtStrategy extends PassportStrategy(Strategy) {
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
    // console.log(`AuthJwtStrategy.validate: payload:`, payload);
    const user = await this.authService.validateTokenPayload(payload);
    return user;
  }
}
