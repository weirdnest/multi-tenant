import { Exclude, Expose } from 'class-transformer';
import { Member } from '../../members/entities/member';
import { AbstractDto } from '@w7t/multi-tenant/infra/abstract/abstract.dto';

@Exclude()
export class User extends AbstractDto<User> {
  @Expose()
  id: string;
  @Expose()
  name?: string;
  @Expose()
  email?: string;

  password: string;

  createdAt: Date;
  updatedAt: Date;

  members?: Member[];
}
