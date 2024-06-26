import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';

import { LoginDto } from './dto/login.dto';
import { AuthMessage } from './constants';

import { IJwtService } from './interfaces/jwt-service.interface';

import { AuthUser } from './dto/auth-user.dto';
import { UserEntity } from '@w7t/multi-tenant/app/entities/user.entity';
import { IConfigService, ServiceRequestContext } from '@w7t/multi-tenant/infra';
import { AuthTenantResponseDto } from './dto';
import { AuthJwtPayload } from './interfaces';
import { IUsersService } from '@w7t/multi-tenant/core/users/interfaces/users-service.interface';
import { IMembersService } from '@w7t/multi-tenant/core/members/interfaces/members-service.interface';
import { MemberEntity } from '../entities/member.entity';
import { TenantsMessage } from '@w7t/multi-tenant/core/tenants/constants';
import { UsersMessage } from '@w7t/multi-tenant/core/users/constants';

@Injectable()
export class AuthService {
  constructor(
    @Inject(IUsersService) private usersService: IUsersService,
    @Inject(IJwtService) private readonly jwtService: IJwtService,
    @Inject(IConfigService) private readonly configService: IConfigService,
    @Inject(IMembersService) private readonly membersService: IMembersService,
  ) { }

  async register(body: RegisterDto): Promise<AuthUser> {
    let hashedPassword = '';
    if (body.password) {
      hashedPassword = await bcrypt.hash(body.password, 10);
    }

    const user = (await this.usersService.create({
      ...body,
      password: hashedPassword,
    })) as AuthUser;
    return user;
  }

  async login(body: LoginDto): Promise<AuthUser> {
    const { email, password } = body || {};

    const user = (await this.usersService.findOne({ email })) as AuthUser;
    const { id: userId } = user || {};
    if (!userId) throw new UnauthorizedException(AuthMessage.UNAUTHORIZED);

    await this.verifyPassword(password, user.password);
    return user;
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new UnauthorizedException(AuthMessage.UNAUTHORIZED);
    }
  }

  getJwtAccessToken(userId: string, data: object = {}) {
    const payload: AuthJwtPayload = { ...data, userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn:
        this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME') || '3 days',
    });
    return token;
  }

  getJwtRefreshToken(userId: string, data: object = {}) {
    const payload: AuthJwtPayload = { ...data, userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME') || '7 days',
    });
    return token;
  }

  async validateTokenPayload(body: AuthJwtPayload) {
    const { userId, tenantId, memberId } = body || {};
    // console.log(`AuthService.validateTokenPayload: body:`, body);
    if (!userId) return false;
    const user = await this.usersService.findOne({ id: userId });
    if (!user?.id) return false;
    if (!tenantId) return user;

    let member: MemberEntity | undefined;
    if (tenantId && memberId) {
      member = await this.membersService.findOne(
        {
          where: {
            id: memberId,
            tenantId,
            userId,
          },
          relations: {
            tenant: true,
            roles: {
              permissions: true,
            },
          },
        },
        { user },
      ) as MemberEntity;
    }
    if (!member?.id) return false;

    const { tenant } = member || {};
    if (tenant) delete member.tenant;

    const result = {
      ...user,
      tenant: {
        ...tenant,
        members: [member],
      },
    };

    return result;
  }

  async tenantLogin(
    tenantId: string,
    context: ServiceRequestContext,
  ): Promise<AuthTenantResponseDto> {
    if (!tenantId) throw new BadRequestException(TenantsMessage.MISSING_ID);
    const { user } = context || {};
    const { id: userId } = user || {};
    if (!userId) {
      throw new InternalServerErrorException(UsersMessage.MISSING_CONTEXT_USER);
    }

    const member = await this.membersService.findOne(
      {
        where: { tenantId, userId },
        relations: { tenant: true },
      },
      { user },
    );

    const { id: memberId, tenant } = member || {};
    if (!memberId) {
      throw new ForbiddenException(AuthMessage.TENANT_LOGIN_FAILED);
    }

    return {
      jwt: {
        access: this.getJwtAccessToken(userId, { tenantId, memberId }),
        refresh: this.getJwtRefreshToken(userId, { tenantId, memberId }),
      },
      user: user as UserEntity,
      member: member,
      tenant: tenant,
    };
  }
}
