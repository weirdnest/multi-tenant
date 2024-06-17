import { InferSubjects } from '@casl/ability';
import { User } from '../core/users/entities/user';
import { Tenant } from '../core/tenants/entities/tenant';
import { Member } from '../core/members/entities/member';
import { Permission } from '../core/permissions/entities/permission';
import { Role } from '../core/roles/entities/role';

export type CaslAbilitySubjects =
  | InferSubjects<
      | typeof User
      | typeof Tenant
      | typeof Member
      | typeof Permission
      | typeof Role
    >
  | 'all';
