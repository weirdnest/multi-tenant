import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: `Role name`,
    maxLength: 64,
    minLength: 1,
    example: `Administrator`,
  })
  @Length(1, 64)
  @IsNotEmpty()
  name: string;

  @Length(0, 1024)
  @IsOptional()
  @ApiProperty({ description: `Role description`, example: `` })
  description?: string;

  @Length(0, 128)
  @IsOptional()
  @ApiProperty({ description: `Role icon`, example: `` })
  icon?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ description: `Set this role to new users`, example: false })
  isDefault?: boolean;
}
