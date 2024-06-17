import {
  IAuthService,
  AuthJwtGuard,
  AuthUser,
  AuthLocalGuard,
  LoginDto,
  LoginResponseDto,
  AuthMessage,
  RegisterDto,
  AuthJwtRefreshGuard,
  JwtRefreshDto,
  RefreshResponseDto,
} from '@w7t/multi-tenant/app/auth';
import { User, UsersMessage } from '@w7t/multi-tenant/core/users';
import { RequestWithContext } from '@w7t/multi-tenant/infra';
import {
  HttpExceptionFilter,
  HttpStatusMessage,
  QueryFailedExceptionFilter,
} from '@w7t/multi-tenant/infra/exceptions';
// import { TransactionInterceptor } from "@w7t/multi-tenant/infra/interceptors/transaction.interceptor";
import { TrimPipe } from '@w7t/multi-tenant/infra/pipes/trim.pipe';
import {
  Controller,
  UseFilters,
  Inject,
  Get,
  UseGuards,
  Request,
  InternalServerErrorException,
  Post,
  HttpStatus,
  UseInterceptors,
  UsePipes,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { UserEntity } from '../entities/user.entity';

@Controller('auth')
@UseFilters(HttpExceptionFilter, QueryFailedExceptionFilter)
@ApiTags(`AuthController`)
export class AuthController {
  constructor(
    @Inject(IAuthService) public readonly authService: IAuthService,
  ) { }

  @Get()
  @UseGuards(AuthJwtGuard)
  @ApiOperation({ summary: `Returns current user` })
  @ApiBearerAuth()
  @ApiResponse({ status: HttpStatus.OK, description: HttpStatusMessage.OK, type: User })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: HttpStatusMessage.UNAUTHORIZED })
  check(@Request() req: RequestWithContext): UserEntity {
    const { user } = req || {};
    if (!user?.id)
      throw new InternalServerErrorException(UsersMessage.MISSING_CONTEXT_USER);
    return new UserEntity(user);
  }

  @Post('login')
  @UseGuards(AuthLocalGuard)
  @ApiOperation({ summary: `Login by email and password` })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: LoginResponseDto,
    description: AuthMessage.CREATED,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: AuthMessage.UNAUTHORIZED,
  })
  login(@Request() req: Request) {
    const { user } = (req as any) || {};
    const { id: userId } = user || {};

    if (!userId) {
      throw new InternalServerErrorException(UsersMessage.MISSING_CONTEXT_USER);
    }
    const accessToken = this.authService.getJwtAccessToken(user.id);
    const refreshToken = this.authService.getJwtRefreshToken(user.id);
    return new LoginResponseDto({
      jwt: { access: accessToken, refresh: refreshToken },
      user,
    });
  }

  @Post('register')
  // @UseInterceptors(TransactionInterceptor)
  @ApiOperation({ summary: `Register new user` })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: UserEntity,
    description: AuthMessage.CREATED,
  })
  @UsePipes(TrimPipe)
  async register(@Body() body: RegisterDto): Promise<UserEntity> {
    const user = await this.authService.register(body);
    return new UserEntity(user);
  }

  @Post('refresh')
  @UseGuards(AuthJwtRefreshGuard)
  @ApiOperation({ summary: `Refresh JWT tokens` })
  @ApiBody({ type: JwtRefreshDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: RefreshResponseDto,
    description: AuthMessage.CREATED,
  })
  refresh(@Request() req: RequestWithContext): RefreshResponseDto {
    const { user } = req || {};
    if (!user?.id)
      throw new InternalServerErrorException(UsersMessage.MISSING_CONTEXT_USER);
    const accessToken = this.authService.getJwtAccessToken(user.id);
    const refreshToken = this.authService.getJwtRefreshToken(user.id);
    return new RefreshResponseDto({
      jwt: { access: accessToken, refresh: refreshToken },
      user: user as AuthUser,
    });
  }
}
