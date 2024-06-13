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

export class MemberRoleDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

export class UpdateMemberDto extends PartialType(CreateMemberDto) {
  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => MemberRoleDto)
  roles?: MemberRoleDto[];
}
