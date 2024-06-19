import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';
import { samplePermissionCanReadAdmin } from '../interfaces/permissions.samples';
import { AbilityAction } from '../../abilities';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: `Unique permission key (within tenant data)`, example: samplePermissionCanReadAdmin.key })
  key: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: `Permission name`, example: samplePermissionCanReadAdmin.name })
  name?: string;

  @IsOptional()
  @IsEnum(AbilityAction)
  @ApiProperty({ description: `Permitted action`, enum: AbilityAction, example: samplePermissionCanReadAdmin.action })
  action?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: `Permission description`, example: samplePermissionCanReadAdmin.description })
  description?: string;

  @IsObject()
  @IsOptional()
  @ApiProperty({ description: `Filter conditions`, example: samplePermissionCanReadAdmin.target })
  target?: any;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: `Resource entity name`, example: samplePermissionCanReadAdmin.resource })
  resource?: string;
}
