
import { Exclude, Expose } from 'class-transformer';
import { User } from '../../users';

@Exclude()
export class AuthUser extends User {
  @Expose()
  email: string;

  password: string;
}
