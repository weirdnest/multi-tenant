import { ApiProperty, OmitType } from "@nestjs/swagger";
import { PermissionEntity } from "../entities/permission.entity";
import { AbstractFindManyResponse } from "./find-many-response.dto";

export class FindManyPermissionsResponse extends AbstractFindManyResponse<PermissionEntity> {
  @ApiProperty({ type: [PermissionEntity] })
  data: PermissionEntity[];
}

export class RemovedPermissionDto extends OmitType(PermissionEntity, ['id', 'tenant', 'roles'] as const) { }
