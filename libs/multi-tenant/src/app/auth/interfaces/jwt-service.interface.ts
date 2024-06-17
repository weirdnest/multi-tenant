import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import {
  JwtSignOptions,
  JwtVerifyOptions,
} from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface';

export interface IJwtService extends JwtService {
  sign(
    payload: string,
    options?: Omit<JwtSignOptions, keyof jwt.SignOptions>,
  ): string;
  sign(payload: Buffer | object, options?: JwtSignOptions): string;
  signAsync(
    payload: string,
    options?: Omit<JwtSignOptions, keyof jwt.SignOptions>,
  ): Promise<string>;
  signAsync(
    payload: Buffer | object,
    options?: JwtSignOptions,
  ): Promise<string>;
  verify<T extends object = any>(token: string, options?: JwtVerifyOptions): T;
  verifyAsync<T extends object = any>(
    token: string,
    options?: JwtVerifyOptions,
  ): Promise<T>;
  decode<T = any>(token: string, options?: jwt.DecodeOptions): T;
}
export const IJwtService = Symbol('IJwtService');
