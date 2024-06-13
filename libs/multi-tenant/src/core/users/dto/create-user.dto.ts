import { AbstractDto } from "@w7t/multi-tenant/infra";
import { IsOptional, IsString } from "class-validator";

export class CreateUserDto extends AbstractDto<CreateUserDto> {
  @IsOptional()
  @IsString()
  name?: string;
}
