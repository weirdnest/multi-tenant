import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthJwtPayload } from './auth-jwt-payload.interface';
import { AuthTenantResponseDto } from '../dto';
import { ServiceRequestContext } from '@w7t/multi-tenant/infra';
import { User } from '../../users';


export abstract class AbstractAuthService {
  abstract register(payload: RegisterDto): Promise<any>;
  abstract login(payload: LoginDto): Promise<any>;
}

export interface IAuthService {
  register(
    payload: RegisterDto,
    context?: ServiceRequestContext,
  ): Promise<User>;
  login(payload: LoginDto): Promise<User>;
  getJwtAccessToken(userId: string, payload?: Record<string, unknown>): string;
  getJwtRefreshToken(userId: string, payload?: Record<string, unknown>): string;
  validateTokenPayload(payload: AuthJwtPayload): Promise<false | User>;
  tenantLogin(
    tenantId: string,
    context?: ServiceRequestContext,
  ): Promise<false | AuthTenantResponseDto>;
}

export const IAuthService = Symbol('IAuthService');
