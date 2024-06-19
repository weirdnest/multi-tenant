import { ApiProperty, OmitType } from "@nestjs/swagger";
import { MemberEntity } from "../entities/member.entity";
import { AbstractFindManyResponse } from "./find-many-response.dto";

export class FindManyMembersResponse extends AbstractFindManyResponse<MemberEntity> {
  @ApiProperty({ type: [MemberEntity] })
  data: MemberEntity[];
}
export class UpdatedMemberDto extends OmitType(MemberEntity, ['user', 'tenant', 'roles'] as const) { }
export class RemovedMemberDto extends OmitType(MemberEntity, ['id', 'user', 'tenant', 'roles'] as const) { }
