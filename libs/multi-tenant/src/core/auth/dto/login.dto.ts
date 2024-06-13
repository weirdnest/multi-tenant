
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { johnDoe } from '../../users/interfaces/users.samples';

export class LoginDto {
  @ApiProperty({ example: johnDoe.email })
  @IsEmail()
  email: string;

  @ApiProperty({ example: johnDoe.password })
  @IsString()
  @MinLength(6)
  password: string;
}
