
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { johnDoe } from '../../users/interfaces/users.samples';

export class RegisterDto {
  @ApiProperty({ example: johnDoe.name })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: johnDoe.email })
  @IsEmail()
  email: string;

  @ApiProperty({ example: johnDoe.password })
  @IsString()
  @MinLength(6)
  password: string;
}
