import { IMembersService } from '@w7t/multi-tenant/core/members/interfaces/members-service.interface';
import { MembersService } from '@w7t/multi-tenant/core/members/members.service';

export const MembersServiceProvider = {
  provide: IMembersService,
  useClass: MembersService,
};
