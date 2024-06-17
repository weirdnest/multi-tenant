import { ApiProperty } from '@nestjs/swagger';
import { johnDoe } from '@w7t/multi-tenant/core/users/interfaces/users.samples';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: johnDoe.email })
  @IsEmail()
  email: string;

  @ApiProperty({ example: johnDoe.password })
  @IsString()
  @MinLength(6)
  password: string;
}
