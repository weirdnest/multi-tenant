import { ConfigService as BaseConfigService } from '@nestjs/config';

export type IConfigService = BaseConfigService;
export const IConfigService = Symbol('IConfigService');
