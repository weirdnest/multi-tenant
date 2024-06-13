import * as jwt from 'jsonwebtoken';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { LoginResponseDto } from '../dto/login-response.dto';

import { IAuthService, AuthJwtPayload } from '../interfaces';

import { MockType } from '@w7t/multi-tenant/infra/abstract/specs/mocks';
import { User } from '../../users/entities/user';

export const HASHED_PASSWORD = 'HASHED_PASSWORD';

export const mockConfigService: MockType<ConfigService> = {
  get: jest.fn().mockImplementation((key) => {
    if (key === 'NODE_ENV') return 'test';
  }),
  set: jest.fn(),
};

export const mockJwtService: MockType<JwtService> = {
  sign: jest.fn(),
  verify: jest.fn(),
  /*
  sign(payload: string, options?: Omit<JwtSignOptions, keyof jwt.SignOptions>): string;
  sign(payload: Buffer | object, options?: JwtSignOptions): string;
  signAsync(payload: string, options?: Omit<JwtSignOptions, keyof jwt.SignOptions>): Promise<string>;
  signAsync(payload: Buffer | object, options?: JwtSignOptions): Promise<string>;
  verify<T extends object = any>(token: string, options?: JwtVerifyOptions): T;
  verifyAsync<T extends object = any>(token: string, options?: JwtVerifyOptions): Promise<T>;
  decode<T = any>(token: string, options?: jwt.DecodeOptions): T;
  */
};

export const mockAuthService: MockType<IAuthService> = {
  register: jest.fn((payload: RegisterDto) => Promise<User>),
  login: jest.fn((payload: LoginDto) => Promise<any>),
  getJwtAccessToken: jest.fn(
    (userId: string, payload?: Record<string, unknown>) => String,
  ),
  getJwtRefreshToken: jest.fn(
    (userId: string, payload?: Record<string, unknown>) => String,
  ),
  validateTokenPayload: jest.fn(
    (payload: AuthJwtPayload) => Promise<false | User>,
  ),
  // tenantLogin: jest.fn((tenantId: string) => Promise<false | LoginResponseDto>),
};
