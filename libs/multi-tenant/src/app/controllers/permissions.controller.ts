import {
  Controller,
  UseFilters,
  UseGuards,
  Inject,
  Post,
  Request,
  UseInterceptors,
  UsePipes,
  Body,
  Get,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AuthJwtGuard, AuthJwtTenantGuard } from '@w7t/multi-tenant/app/auth';
import { CreatePermissionDto } from '@w7t/multi-tenant/core/permissions/dto/create-permission.dto';
import { IPermissionsService } from '@w7t/multi-tenant/core/permissions/interfaces/permissions-service.interface';
import { RequestWithContext } from '@w7t/multi-tenant/infra';
import {
  HttpExceptionFilter,
  QueryFailedExceptionFilter,
} from '@w7t/multi-tenant/infra/exceptions';
// import { TransactionInterceptor } from "src/infra/interceptors/transaction.interceptor";
import { TrimPipe } from '@w7t/multi-tenant/infra/pipes';

@Controller('permissions')
@UseFilters(HttpExceptionFilter, QueryFailedExceptionFilter)
@UseGuards(AuthJwtGuard, AuthJwtTenantGuard)
export class PermissionsController {
  constructor(
    @Inject(IPermissionsService)
    private readonly permissionsService: IPermissionsService,
  ) { }

  @Post()
  // @UseInterceptors(TransactionInterceptor)
  @UsePipes(TrimPipe)
  async create(
    @Body() body: CreatePermissionDto,
    @Request() req: RequestWithContext,
  ) {
    const { user, tenant, entityManager } = req;
    return await this.permissionsService.create(body, {
      user,
      tenant,
      entityManager,
    });
  }

  @Get()
  async find(@Query() query: any, @Request() req: RequestWithContext) {
    const { user, tenant } = req;
    return await this.permissionsService.findMany(query, { user, tenant });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: RequestWithContext) {
    const { user, tenant } = req;
    return await this.permissionsService.findOne({ id }, { user, tenant });
  }

  @Delete(':id')
  // @UseInterceptors(TransactionInterceptor)
  async remove(@Param('id') id: string, @Request() req: RequestWithContext) {
    const { user, tenant, entityManager } = req;
    return await this.permissionsService.remove(id, {
      user,
      tenant,
      entityManager,
    });
  }
}
