import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  info(): Record<string, unknown> {
    return {
      version: process.env?.npm_package_version || '',
    };
  }
}
