import { Member } from '../../members/entities/member';
import { Permission } from '../../permissions/entities/permission';

export class Role {
  id: string;
  name: string;
  tenantId: string;
  slug: string;
  permissions?: Permission[];
  members?: Member[];
}
