import { Controller, Get, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppInfoDto } from './app.dto';

@Controller()
@ApiTags('AppController')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiOperation({ summary: `Get version` })
  @ApiResponse({ status: HttpStatus.OK, type: AppInfoDto })
  info(): Record<string, unknown> {
    return this.appService.info();
  }
}
