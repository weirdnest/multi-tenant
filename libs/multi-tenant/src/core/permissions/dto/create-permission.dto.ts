// import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
// import { Action } from '@app/casl/enums/action.enum';

export class CreatePermissionDto {
  // @ApiProperty()
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsOptional()
  name?: string;

  // @IsOptional()
  // @IsEnum(Action)
  // action?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
