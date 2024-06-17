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
} from '@nestjs/common';
import { AuthJwtGuard, AuthJwtTenantGuard } from '@w7t/multi-tenant/app/auth';
import { RolesMessage } from '@w7t/multi-tenant/core/roles/constants';
import { UpdateRoleDto } from '@w7t/multi-tenant/core/roles/dto/update-role.dto';
import { IRolesService } from '@w7t/multi-tenant/core/roles/interfaces/roles-service.interface';
import { CreateTenantDto } from '@w7t/multi-tenant/core/tenants';
import { RequestWithContext } from '@w7t/multi-tenant/infra';
import {
  HttpExceptionFilter,
  QueryFailedExceptionFilter,
} from '@w7t/multi-tenant/infra/exceptions';
// import { TransactionInterceptor } from "src/infra/interceptors/transaction.interceptor";
import { RoleEntity } from '../entities/role.entity';

@Controller('roles')
@UseFilters(HttpExceptionFilter, QueryFailedExceptionFilter)
@UseGuards(AuthJwtGuard, AuthJwtTenantGuard)
export class RolesController {
  constructor(
    @Inject(IRolesService) private readonly rolesService: IRolesService,
  ) { }

  @Post()
  // @UseInterceptors(TransactionInterceptor)
  async create(
    @Body() body: CreateTenantDto,
    @Request() req: RequestWithContext,
  ) {
    const { user, tenant, entityManager } = req;
    const result = (await this.rolesService.create(body, {
      user,
      tenant,
      entityManager,
    })) as RoleEntity;
    return new RoleEntity(result);
  }

  @Get()
  async findMany(@Query() query: any, @Request() req: RequestWithContext) {
    const { user, tenant } = req;
    query = {
      where: { ...query },
      relations: { permissions: true },
    };
    return await this.rolesService.findMany(query, { user, tenant });
  }

  @Get(':id')
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
  async update(
    @Param('id') id: string,
    @Body() body: UpdateRoleDto,
    @Request() req: RequestWithContext,
  ) {
    const { user, tenant, entityManager } = req;
    const result = (await this.rolesService.update(id, body, {
      user,
      tenant,
      entityManager,
    })) as RoleEntity;
    return new RoleEntity(result);
  }

  @Delete(':id')
  // @UseInterceptors(TransactionInterceptor)
  async remove(@Param('id') id: string, @Request() req: RequestWithContext) {
    const { user, tenant, entityManager } = req;
    return await this.rolesService.remove(id, { user, tenant, entityManager });
  }
}
