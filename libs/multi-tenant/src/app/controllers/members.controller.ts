import {
  Controller,
  UseFilters,
  UseGuards,
  Inject,
  Post,
  Request,
  Query,
  UseInterceptors,
  Body,
  Get,
  Param,
  NotFoundException,
  Patch,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { AuthJwtGuard, AuthJwtTenantGuard } from '@w7t/multi-tenant/app/auth';
import { MembersMessage } from '@w7t/multi-tenant/core/members/constants';
import { CreateMemberDto } from '@w7t/multi-tenant/core/members/dto/create-member.dto';
import { UpdateMemberDto } from '@w7t/multi-tenant/core/members/dto/update-member.dto';
import { IMembersService } from '@w7t/multi-tenant/core/members/interfaces/members-service.interface';
import { RequestWithContext } from '@w7t/multi-tenant/infra';
import {
  HttpExceptionFilter,
  HttpStatusMessage,
  QueryFailedExceptionFilter,
} from '@w7t/multi-tenant/infra/exceptions';
// import { TransactionInterceptor } from "src/infra/interceptors/transaction.interceptor";
import { MemberEntity } from '../entities/member.entity';
import { ApiExtraModels, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindManyMembersResponse, RemovedMemberDto, UpdatedMemberDto } from '../dto/members.dto';

@Controller('members')
@UseFilters(HttpExceptionFilter, QueryFailedExceptionFilter)
@UseGuards(AuthJwtGuard, AuthJwtTenantGuard)
@ApiTags('MembersController')
export class MembersController {
  constructor(
    @Inject(IMembersService) private readonly membersService: IMembersService,
  ) { }

  @Post()
  // @UseInterceptors(TransactionInterceptor)
  @ApiOperation({ summary: `Create member` })
  @ApiResponse({ status: HttpStatus.CREATED, description: `Member created`, type: MemberEntity })
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
  @ApiOperation({ summary: `Find list of member` })
  @ApiResponse({ status: HttpStatus.OK, type: FindManyMembersResponse })
  async findMany(@Query() query: any, @Request() req: RequestWithContext) {
    const { user, tenant } = req;
    query = {
      where: { ...query || {} },
      relations: { roles: true },
    };
    const result = await this.membersService.findMany(query, { user, tenant });
    return new FindManyMembersResponse(result);
  }

  @Get(':id')
  @ApiOperation({ summary: `Find member by id` })
  @ApiResponse({ status: HttpStatus.OK, description: `Member found`, type: MemberEntity })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: MembersMessage.NOT_FOUND })
  async findOne(@Param('id') id: string, @Request() req: RequestWithContext) {
    const { user, tenant } = req;
    const result = (await this.membersService.findOne(
      {
        where: { id },
        relations: { roles: true },
      },
      { user, tenant },
    )) as MemberEntity;
    if (!result?.id) throw new NotFoundException(MembersMessage.NOT_FOUND);
    return new MemberEntity(result);
  }

  @Patch(':id')
  // @UseInterceptors(TransactionInterceptor)
  @ApiOperation({ summary: `Update member` })
  @ApiResponse({ status: HttpStatus.OK, description: `Updated member`, type: [MemberEntity] })
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
    console.log(`MembersController.update: result:`, result);
    return new MemberEntity(result);
  }

  @Delete(':id')
  // @UseInterceptors(TransactionInterceptor)
  @ApiOperation({ summary: `Delete member` })
  @ApiResponse({ status: HttpStatus.OK, description: `Removed member without id`, type: [RemovedMemberDto] })
  async remove(@Param('id') id: string, @Request() req: RequestWithContext) {
    const { user, tenant, entityManager } = req;
    console.log(`MembersController.remove: id:`, id);
    const result = await this.membersService.remove(id, {
      user,
      tenant,
      entityManager,
    });
    return new RemovedMemberDto(result);
  }
}
