import { ApiProperty } from "@nestjs/swagger";


export class AppInfoDto {
  @ApiProperty({ example: process.env?.npm_package_version || '0.0.1' })
  version: string;

  constructor(partial: AppInfoDto) {
    Object.assign(this, partial);
  }
}
