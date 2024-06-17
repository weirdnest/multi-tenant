import { ApiProperty } from '@nestjs/swagger';
import { johnDoe } from '@w7t/multi-tenant/core/users/interfaces/users.samples';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';


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
