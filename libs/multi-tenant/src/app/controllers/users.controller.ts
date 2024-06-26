import { IUsersService } from '@w7t/multi-tenant/core/users';
import {
  HttpExceptionFilter,
  QueryFailedExceptionFilter,
} from '@w7t/multi-tenant/infra/exceptions';
import { Controller, Get, Inject, UseFilters } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
// import { TransactionInterceptor } from "src/infra/interceptors/transaction.interceptor";

@Controller('users')
@UseFilters(HttpExceptionFilter, QueryFailedExceptionFilter)
@ApiTags('UsersController')
export class UsersController {
  constructor(
    @Inject(IUsersService) private readonly usersService: IUsersService,
  ) { }

  @Get()
  async find() {
    return this.usersService.findMany({});
    // return [];
  }
}
