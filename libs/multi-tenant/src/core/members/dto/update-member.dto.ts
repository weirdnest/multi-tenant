import { PartialType } from '@nestjs/mapped-types';
import { CreateMemberDto } from './create-member.dto';
import {
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { johnDoe } from '../../users/interfaces/users.samples';
import { sampleRoleAdmin } from '../../roles/interfaces/roles.samples';

export class MemberRoleDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ example: sampleRoleAdmin.id })
  id: string;
}

export class UpdateMemberDto extends PartialType(CreateMemberDto) {
  @IsOptional()
  @ApiProperty({ example: johnDoe.email })
  email?: string;

  @IsOptional()
  @ApiProperty({ example: johnDoe.name })
  name?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => MemberRoleDto)
  @ApiProperty({ type: [MemberRoleDto] })
  roles?: MemberRoleDto[];
}
