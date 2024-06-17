import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IAuthService } from '../interfaces/auth-service.interface';
import { User } from '@w7t/multi-tenant/core/users/entities/user';

@Injectable()
export class AuthLocalStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(IAuthService) private authService: IAuthService) {
    super({ usernameField: 'email' });
  }

  validate(email: string, password: string): Promise<User | false> {
    return this.authService.login({ email, password });
  }
}
