import * as _ from 'lodash';


import {
  Controller,
  UseFilters,
  Inject,
  Get,
  UseGuards,
  HttpStatus,
  InternalServerErrorException,
  ForbiddenException,
  Post,
  Param,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

import { MemberEntity } from '../entities/member.entity';
import { HttpExceptionFilter, QueryFailedExceptionFilter } from '@w7t/multi-tenant/infra/exceptions/filters';
import { AuthJwtGuard, AuthJwtTenantGuard, AuthMessage, AuthTenantLoginDto, AuthTenantResponseDto, IAuthService } from '@w7t/multi-tenant/core/auth';
import { IMembersService } from '@w7t/multi-tenant/core/members/interfaces/members-service.interface';
import { HttpStatusMessage } from '@w7t/multi-tenant/infra/exceptions/constants';
import { RequestWithContext } from '@w7t/multi-tenant/infra/interfaces/request-with-context.interface';
import { UsersMessage } from '@w7t/multi-tenant/core/users/constants';
import { TenantsMessage } from '@w7t/multi-tenant/core/tenants/constants';
import { MembersMessage } from '@w7t/multi-tenant/core/members/constants';

@Controller('auth/tenant')
@UseFilters(HttpExceptionFilter, QueryFailedExceptionFilter)
@UseGuards(AuthJwtGuard)
@ApiTags(`AuthController`)
export class AuthTenantController {
  constructor(
    @Inject(IMembersService) private readonly membersService: IMembersService,
    @Inject(IAuthService) private readonly authService: IAuthService,
  ) { }

  @Get()
  @UseGuards(AuthJwtTenantGuard)
  @ApiOperation({ summary: `Returns user with tenant data` })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: HttpStatusMessage.OK,
    type: MemberEntity,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: HttpStatusMessage.UNAUTHORIZED,
  })
  check(@Request() req: RequestWithContext): MemberEntity {
    const { user, tenant } = req || {};
    const { id: userId } = (user as any) || {};
    const { id: tenantId } = tenant || {};
    console.log(`AuthTenantController.check:`, { user, tenant })
    if (!userId)
      throw new InternalServerErrorException(UsersMessage.MISSING_CONTEXT_USER);
    if (!tenantId)
      throw new ForbiddenException(TenantsMessage.MEMBER_NOT_LOGGED);
    const member = _.get(tenant, 'members.0', null);
    if (!member?.id)
      throw new InternalServerErrorException(
        MembersMessage.MISSING_CONTEXT_MEMBER,
      );

    return new MemberEntity({
      ...member,
      user: {
        ...user,
        tenant: undefined,
      },
      tenant: { ...tenant, members: undefined },
    });
  }

  @Post(':tenantid/login')
  @UseGuards(AuthJwtGuard)
  @ApiOperation({ summary: `Login as tenant member` })
  @ApiBody({ type: AuthTenantLoginDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: AuthTenantResponseDto,
    description: AuthMessage.CREATED,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: AuthMessage.UNAUTHORIZED,
  })
  async login(
    @Param('tenantid') tenantId: string,
    @Request() req: RequestWithContext,
  ) {
    const { user, tenant } = req || {};
    const { id: userId } = user || {};

    if (!userId)
      throw new InternalServerErrorException(UsersMessage.MISSING_CONTEXT_USER);
    // console.log(`AuthTenantController.login:`, { userId, tenantId });
    const response = await this.authService.tenantLogin(tenantId, {
      user,
      tenant,
    });
    // console.log(`AuthTenantController.login: response:`, response);
    if (!response)
      throw new UnauthorizedException(AuthMessage.TENANT_LOGIN_FAILED);
    return new AuthTenantResponseDto(response);
  }

  @Post(':tenantid/register')
  @UseGuards(AuthJwtGuard)
  @ApiOperation({ summary: `Register tenant member` })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: MemberEntity,
    description: AuthMessage.CREATED,
  })
  async register(
    @Param('tenantid') tenantId: string,
    @Request() req: RequestWithContext,
  ) {
    const { user } = req || {};
    const { id: userId } = user || {};
    const member = await this.membersService.create({
      tenantId,
      userId,
      isOwner: false,
      name: user.name,
      email: user.email,
    });
    const { id: memberId } = member || {};
    // this.logger.verbose({ tenantId, memberId });
    return new MemberEntity(member as MemberEntity);
  }
}
