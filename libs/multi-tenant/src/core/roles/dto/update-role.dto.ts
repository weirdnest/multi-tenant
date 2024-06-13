import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PermissionDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ValidateNested()
  @Type(() => PermissionDto)
  @IsArray()
  @IsOptional()
  permissions: PermissionDto[];
}
