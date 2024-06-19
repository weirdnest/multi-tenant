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
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthJwtGuard, AuthJwtTenantGuard } from '@w7t/multi-tenant/app/auth';
import { CreatePermissionDto } from '@w7t/multi-tenant/core/permissions/dto/create-permission.dto';
import { IPermissionsService } from '@w7t/multi-tenant/core/permissions/interfaces/permissions-service.interface';
import { RequestWithContext } from '@w7t/multi-tenant/infra';
import {
  HttpExceptionFilter,
  HttpStatusMessage,
  QueryFailedExceptionFilter,
} from '@w7t/multi-tenant/infra/exceptions';
// import { TransactionInterceptor } from "@w7t/multi-tenant/infra/interceptors/transaction.interceptor";
import { TrimPipe } from '@w7t/multi-tenant/infra/pipes';
import { PermissionEntity } from '../entities/permission.entity';
import { FindManyPermissionsResponse, RemovedPermissionDto } from '../dto/permissions.dto';

@Controller('permissions')
@UseFilters(HttpExceptionFilter, QueryFailedExceptionFilter)
@UseGuards(AuthJwtGuard, AuthJwtTenantGuard)
@ApiTags('PermissionsController')
export class PermissionsController {
  constructor(
    @Inject(IPermissionsService)
    private readonly permissionsService: IPermissionsService,
  ) { }

  @Post()
  // @UseInterceptors(TransactionInterceptor)
  @UsePipes(TrimPipe)
  @ApiOperation({ summary: 'Creates permission' })
  @ApiResponse({ status: HttpStatus.CREATED, description: `Permission was created`, type: PermissionEntity })
  async create(
    @Body() body: CreatePermissionDto,
    @Request() req: RequestWithContext,
  ) {
    const { user, tenant, entityManager } = req;
    const result = await this.permissionsService.create(body, {
      user,
      tenant,
      entityManager,
    });

    return new PermissionEntity(result);
  }

  @Get()
  @ApiOperation({ summary: 'Finds list of permissions' })
  @ApiResponse({ status: HttpStatus.OK, description: HttpStatusMessage.OK, type: FindManyPermissionsResponse })
  async findMany(@Query() query: any, @Request() req: RequestWithContext) {
    const { user, tenant } = req;
    const result = await this.permissionsService.findMany(query, { user, tenant });
    return new FindManyPermissionsResponse(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Finds permission by id' })
  @ApiResponse({ status: HttpStatus.OK, description: HttpStatusMessage.OK, type: PermissionEntity })
  async findOne(@Param('id') id: string, @Request() req: RequestWithContext) {
    const { user, tenant } = req;
    const result = await this.permissionsService.findOne({ id }, { user, tenant });
    return new PermissionEntity(result);
  }

  @Delete(':id')
  // @UseInterceptors(TransactionInterceptor)
  @ApiOperation({ summary: 'Removes permission' })
  @ApiResponse({ status: HttpStatus.OK, description: `Permission was removed`, type: RemovedPermissionDto })
  async remove(@Param('id') id: string, @Request() req: RequestWithContext) {
    const { user, tenant, entityManager } = req;
    const result = await this.permissionsService.remove(id, {
      user,
      tenant,
      entityManager,
    });
    return new RemovedPermissionDto(result);
  }
}
