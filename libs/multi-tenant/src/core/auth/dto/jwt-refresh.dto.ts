import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class JwtRefreshDto {
  @ApiProperty({ description: `JWT refresh token` })
  @IsString()
  refreshToken: string;
}
