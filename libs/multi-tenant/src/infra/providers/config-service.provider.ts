import { ConfigService } from '@nestjs/config';
import { IConfigService } from '../interfaces/config-service.interface';

export const ConfigServiceProvider = {
  provide: IConfigService,
  useClass: ConfigService,
};
