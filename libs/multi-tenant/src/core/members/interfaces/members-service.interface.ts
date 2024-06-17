import { Member } from '../entities/member';
import { CreateMemberDto } from '../dto/create-member.dto';
import { UpdateMemberDto } from '../dto/update-member.dto';
import { ServiceInterface } from '@w7t/multi-tenant/infra/interfaces/service.interface';

export type IMembersService = ServiceInterface<
  Member,
  CreateMemberDto,
  UpdateMemberDto
>;

export const IMembersService = Symbol('IMembersService');
