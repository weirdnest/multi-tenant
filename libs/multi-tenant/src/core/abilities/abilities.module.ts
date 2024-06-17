import { Module } from '@nestjs/common';
// import { AbilitiesService } from './abilities.service';
import {
  AbilitiesServiceProvider,
  AbilityFactoryProvider,
} from '@w7t/multi-tenant/infra';

@Module({
  providers: [AbilityFactoryProvider, AbilitiesServiceProvider],
  exports: [AbilitiesServiceProvider],
})
export class AbilitiesModule {}
