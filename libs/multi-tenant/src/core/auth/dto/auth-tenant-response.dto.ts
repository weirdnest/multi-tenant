import { UserEntity } from '@w7t/multi-tenant/app/entities/user.entity';
import { AbstractDto } from '@w7t/multi-tenant/infra';
import { ApiProperty } from '@nestjs/swagger/dist/decorators';
import { Expose, Type } from 'class-transformer';
import { JwtTokensDto } from './login-response.dto';
import { Member } from '../../members/entities/member';
import { Tenant } from '../../tenants/entities/tenant';

export class AuthTenantResponseDto extends AbstractDto<AuthTenantResponseDto> {
  @ApiProperty()
  @Expose()
  @Type(() => JwtTokensDto)
  jwt: JwtTokensDto;

  @ApiProperty()
  @Expose()
  @Type(() => Member)
  member: Member;

  @ApiProperty()
  @Expose()
  @Type(() => Tenant)
  tenant: Tenant;

  @ApiProperty()
  @Expose()
  @Type(() => UserEntity)
  user: UserEntity;
}

/*
import { User } from "@w7t/users-api/users";
import { ApiProperty } from "@nestjs/swagger";
import { JwtTokensDto } from "./login-response.dto";
import { Tenant } from "@w7t/users-api/tenants";
import { Exclude, Expose, Type } from "class-transformer";
import { DtoBase } from "@w7t/utils/interfaces/dto/dto-base";

@Exclude()
export class TenantLoginResponseDto extends DtoBase<TenantLoginResponseDto> {
  @ApiProperty()
  @Expose()
  @Type(() => JwtTokensDto)
  jwt: JwtTokensDto;

  @ApiProperty()
  @Expose()
  @Type(() => Tenant)
  tenant: Tenant;

  @ApiProperty()
  @Expose()
  @Type(() => User)
  user: User;
}

export class TenantRefreshResponseDto {
  @ApiProperty()
  jwt: JwtTokensDto;
  @ApiProperty()
  user: User;
}
*/
