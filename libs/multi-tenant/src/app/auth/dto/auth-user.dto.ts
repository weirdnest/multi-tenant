import { Exclude, Expose } from 'class-transformer';
import { UserEntity } from '../../entities/user.entity';


@Exclude()
export class AuthUser extends UserEntity {
  @Expose()
  email: string;

  password: string;
}
