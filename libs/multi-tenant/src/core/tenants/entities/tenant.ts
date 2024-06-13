import { Member } from '../../members/entities/member';
import { Permission } from '../../permissions/entities/permission';
import { Role } from '../../roles/entities/role';

export class Tenant {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;

  members?: Member[];
  roles?: Role[];
  permissions?: Permission[];
}
