import {
  Controller,
  UseFilters,
  UseGuards,
  Inject,
  Post,
  Request,
  UseInterceptors,
  Body,
  Get,
  Param,
  NotFoundException,
  Patch,
  Delete,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { AuthJwtGuard, AuthJwtTenantGuard } from '@w7t/multi-tenant/app/auth';
import { RolesMessage } from '@w7t/multi-tenant/core/roles/constants';
import { UpdateRoleDto } from '@w7t/multi-tenant/core/roles/dto/update-role.dto';
import { IRolesService } from '@w7t/multi-tenant/core/roles/interfaces/roles-service.interface';
import { RequestWithContext } from '@w7t/multi-tenant/infra';
import {
  HttpExceptionFilter,
  HttpStatusMessage,
  QueryFailedExceptionFilter,
} from '@w7t/multi-tenant/infra/exceptions';
// import { TransactionInterceptor } from "@w7t/multi-tenant/infra/interceptors/transaction.interceptor";
import { RoleEntity } from '../entities/role.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindManyRolesResponse, RemovedRoleDto, UpdatedRoleDto } from '../dto/roles.dto';
import { CreateRoleDto } from '@w7t/multi-tenant/core/roles/dto/create-role.dto';

@Controller('roles')
@UseFilters(HttpExceptionFilter, QueryFailedExceptionFilter)
@UseGuards(AuthJwtGuard, AuthJwtTenantGuard)
@ApiTags('RolesController')
export class RolesController {
  constructor(
    @Inject(IRolesService) private readonly rolesService: IRolesService,
  ) { }

  @Post()
  // @UseInterceptors(TransactionInterceptor)
  @ApiOperation({ summary: `Create new role` })
  @ApiResponse({ status: HttpStatus.CREATED, description: `Role was created`, type: RoleEntity })
  async create(
    @Body() body: CreateRoleDto,
    @Request() req: RequestWithContext,
  ) {
    const { user, tenant, entityManager } = req;
    const result = await this.rolesService.create(body, {
      user,
      tenant,
      entityManager,
    });
    return new RoleEntity(result);
  }

  @Get()
  @ApiOperation({ summary: `Finds list of roles` })
  @ApiResponse({ status: HttpStatus.OK, description: HttpStatusMessage.OK, type: FindManyRolesResponse })
  async findMany(@Query() query: any, @Request() req: RequestWithContext) {
    const { user, tenant } = req;
    query = {
      where: { ...query },
      relations: { permissions: true },
    };
    const result = await this.rolesService.findMany(query, { user, tenant });
    return new FindManyRolesResponse(result);
  }

  @Get(':id')
  @ApiOperation({ summary: `Finds role by id` })
  @ApiResponse({ status: HttpStatus.OK, description: HttpStatusMessage.OK, type: RoleEntity })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: RolesMessage.NOT_FOUND })
  async findOne(@Param('id') id: string, @Request() req: RequestWithContext) {
    const { user, tenant } = req;
    const query = { where: { id }, relations: { permissions: true } };
    const result = (await this.rolesService.findOne(query, {
      user,
      tenant,
    })) as RoleEntity;
    if (!result?.id) throw new NotFoundException(RolesMessage.NOT_FOUND);
    return new RoleEntity(result);
  }

  @Patch(':id')
  // @UseInterceptors(TransactionInterceptor)
  @ApiOperation({ summary: `Updates role` })
  @ApiResponse({ status: HttpStatus.OK, description: HttpStatusMessage.OK, type: UpdatedRoleDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: RolesMessage.NOT_FOUND })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateRoleDto,
    @Request() req: RequestWithContext,
  ) {
    const { user, tenant, entityManager } = req;
    const result = await this.rolesService.update(id, body, {
      user,
      tenant,
      entityManager,
    });
    return new UpdateRoleDto(result);
  }

  @Delete(':id')
  // @UseInterceptors(TransactionInterceptor)
  @ApiOperation({ summary: `Removes role` })
  @ApiResponse({ status: HttpStatus.OK, description: HttpStatusMessage.OK, type: RemovedRoleDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: RolesMessage.NOT_FOUND })
  async remove(@Param('id') id: string, @Request() req: RequestWithContext) {
    const { user, tenant, entityManager } = req;
    return await this.rolesService.remove(id, { user, tenant, entityManager });
  }
}
