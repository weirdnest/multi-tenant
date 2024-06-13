import { IMembersRepository } from '../../core/members/interfaces/members-repository.interface';
import { MembersRepository } from '../repositories/members.repository';

export const MembersRepositoryProvider = {
  provide: IMembersRepository,
  useClass: MembersRepository,
};
