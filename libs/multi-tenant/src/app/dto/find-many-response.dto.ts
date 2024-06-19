import { ApiProperty } from "@nestjs/swagger";
import { AbstractDto } from "@w7t/multi-tenant/infra";

export class AbstractFindManyResponse<Entity> extends AbstractDto<AbstractFindManyResponse<Entity>> {
  @ApiProperty({ example: 1 })
  total: number;
  data: Entity[];
}
