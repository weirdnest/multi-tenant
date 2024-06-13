import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateMemberDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsUUID()
  tenantId: string;

  @IsUUID()
  userId: string;

  @IsOptional()
  @IsBoolean()
  isOwner: boolean;
}
