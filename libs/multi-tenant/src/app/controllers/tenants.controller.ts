import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Request,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { AuthJwtGuard } from '@w7t/multi-tenant/app/auth/guards/auth-jwt.guard';
import { CreateTenantDto } from '@w7t/multi-tenant/core/tenants/dto/create-tenant.dto';
import { ITenantsService } from '@w7t/multi-tenant/core/tenants/interfaces/tenants-service.interface';
import {
  HttpExceptionFilter,
  QueryFailedExceptionFilter,
} from '@w7t/multi-tenant/infra/exceptions/filters';
// import { TransactionInterceptor } from "src/infra/interceptors/transaction.interceptor";
import { RequestWithContext } from '@w7t/multi-tenant/infra/interfaces';
import { TrimPipe } from '@w7t/multi-tenant/infra/pipes';

@Controller('tenants')
@UseFilters(HttpExceptionFilter, QueryFailedExceptionFilter)
@UseGuards(AuthJwtGuard)
export class TenantsController {
  constructor(
    @Inject(ITenantsService) private readonly tenantsService: ITenantsService,
  ) {}

  @Get()
  async find(@Query() query: any, @Request() req: RequestWithContext) {
    const { user, tenant } = req;
    return await this.tenantsService.findMany(query, { user, tenant });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: RequestWithContext) {
    const { user, tenant } = req;
    return await this.tenantsService.findOne({ id }, { user, tenant });
  }

  @Post()
  @UsePipes(TrimPipe)
  // @UseInterceptors(TransactionInterceptor)
  async create(
    @Body() body: CreateTenantDto,
    @Request() req: RequestWithContext,
  ) {
    const { user, tenant, entityManager } = req;
    return await this.tenantsService.create(body, {
      user,
      tenant,
      entityManager,
    });
  }

  @Delete(':id')
  // @UseInterceptors(TransactionInterceptor)
  async remove(@Param('id') id: string, @Request() req: RequestWithContext) {
    const { user, tenant, entityManager } = req;
    return await this.tenantsService.remove(id, {
      user,
      tenant,
      entityManager,
    });
  }
}
