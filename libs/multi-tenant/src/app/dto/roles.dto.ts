import { ApiProperty, OmitType } from "@nestjs/swagger";
import { RoleEntity } from "../entities/role.entity";
import { AbstractFindManyResponse } from "./find-many-response.dto";

export class FindManyRolesResponse extends AbstractFindManyResponse<RoleEntity> {
  @ApiProperty({ type: [RoleEntity] })
  data: RoleEntity[];
}
export class UpdatedRoleDto extends OmitType(RoleEntity, ['tenant'] as const) { }
export class RemovedRoleDto extends OmitType(RoleEntity, ['id', 'tenant', 'permissions'] as const) { }
