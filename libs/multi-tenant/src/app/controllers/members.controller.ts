import { Controller, UseFilters, UseGuards, Inject, Post, Request, Query, UseInterceptors, Body, Get, Param, NotFoundException, Patch, Delete } from "@nestjs/common";
import { AuthJwtGuard, AuthJwtTenantGuard } from "@w7t/multi-tenant/core/auth";
import { MembersMessage } from "@w7t/multi-tenant/core/members/constants";
import { CreateMemberDto } from "@w7t/multi-tenant/core/members/dto/create-member.dto";
import { UpdateMemberDto } from "@w7t/multi-tenant/core/members/dto/update-member.dto";
import { IMembersService } from "@w7t/multi-tenant/core/members/interfaces/members-service.interface";
import { RequestWithContext } from "@w7t/multi-tenant/infra";
import { HttpExceptionFilter, QueryFailedExceptionFilter } from "@w7t/multi-tenant/infra/exceptions";
// import { TransactionInterceptor } from "src/infra/interceptors/transaction.interceptor";
import { MemberEntity } from "../entities/member.entity";

@Controller('members')
@UseFilters(HttpExceptionFilter, QueryFailedExceptionFilter)
@UseGuards(AuthJwtGuard, AuthJwtTenantGuard)
export class MembersController {
  constructor(
    @Inject(IMembersService) private readonly membersService: IMembersService,
  ) { }

  @Post()
  // @UseInterceptors(TransactionInterceptor)
  async create(
    @Body() body: CreateMemberDto,
    @Request() req: RequestWithContext,
  ) {
    const { user, tenant, entityManager } = req;
    const result = (await this.membersService.create(body, {
      user,
      tenant,
      entityManager,
    })) as MemberEntity;
    return new MemberEntity(result);
  }

  @Get()
  async findMany(@Query() query: any, @Request() req: RequestWithContext) {
    const { user, tenant } = req;
    query = {
      where: { ...query },
      relations: { roles: true },
    };
    return await this.membersService.findMany(query, { user, tenant });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: RequestWithContext) {
    const { user, tenant } = req;
    const result = (await this.membersService.findOne(
      { id },
      { user, tenant },
    )) as MemberEntity;
    if (!result?.id) throw new NotFoundException(MembersMessage.NOT_FOUND);
    return new MemberEntity(result);
  }

  @Patch(':id')
  // @UseInterceptors(TransactionInterceptor)
  async update(
    @Param('id') id: string,
    @Body() body: UpdateMemberDto,
    @Request() req: RequestWithContext,
  ) {
    const { user, tenant, entityManager } = req;
    const result = (await this.membersService.update(id, body, {
      user,
      tenant,
      entityManager,
    })) as MemberEntity;
    return new MemberEntity(result);
  }

  @Delete(':id')
  // @UseInterceptors(TransactionInterceptor)
  async remove(@Param('id') id: string, @Request() req: RequestWithContext) {
    const { user, tenant, entityManager } = req;
    return await this.membersService.remove(id, {
      user,
      tenant,
      entityManager,
    });
  }
}
