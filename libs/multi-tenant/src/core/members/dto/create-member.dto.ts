import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { johnDoe } from '../../users/interfaces/users.samples';
import { sampleTenant01 } from '../../tenants/interfaces/tenants.samples';
import { Type } from 'class-transformer';

export class RoleDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
export class CreateMemberDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsUUID()
  @ApiProperty({ example: sampleTenant01.id })
  tenantId: string;

  @IsUUID()
  @ApiProperty({ example: johnDoe.id })
  userId: string;

  @IsOptional()
  @IsBoolean()
  isOwner?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => RoleDto)
  @IsArray()
  roles?: RoleDto[];
}
