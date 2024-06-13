import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { AbilitiesServiceProvider } from '@w7t/multi-tenant/infra/providers';

@Module({
  // controllers: [TenantsController],
  providers: [TenantsService, AbilitiesServiceProvider],
})
export class TenantsModule { }
