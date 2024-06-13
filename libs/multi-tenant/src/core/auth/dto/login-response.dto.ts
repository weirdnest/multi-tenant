
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { AuthUser } from './auth-user.dto';
import { AbstractDto } from '@w7t/multi-tenant/infra/abstract/abstract.dto';

export class JwtTokensDto extends AbstractDto<JwtTokensDto> {
  @ApiProperty()
  access: string;
  @ApiProperty()
  refresh: string;
}

@Exclude()
export class LoginResponseDto extends AbstractDto<LoginResponseDto> {
  @ApiProperty()
  @Type(() => JwtTokensDto)
  @Expose()
  jwt: JwtTokensDto;

  @ApiProperty()
  @Expose()
  @ValidateNested()
  @Type(() => AuthUser)
  user: AuthUser;
}

@Exclude()
export class RefreshResponseDto extends AbstractDto<RefreshResponseDto> {
  @ApiProperty()
  @Type(() => JwtTokensDto)
  @Expose()
  jwt: JwtTokensDto;

  @ApiProperty()
  @Type(() => AuthUser)
  @Expose()
  user: AuthUser;
}
