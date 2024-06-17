import { Test, TestingModule } from '@nestjs/testing';
import { ClassSerializerInterceptor, HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IUsersService } from '@w7t/multi-tenant/core/users/interfaces/users-service.interface';
import { janeDoe, johnDoe } from '@w7t/multi-tenant/core/users/interfaces/users.samples';
import { IPermissionsService } from '@w7t/multi-tenant/core/permissions/interfaces/permissions-service.interface';
import { ITenantsService } from '@w7t/multi-tenant/core/tenants';
import { IRolesService } from '@w7t/multi-tenant/core/roles/interfaces/roles-service.interface';
import { IMembersService } from '@w7t/multi-tenant/core/members/interfaces/members-service.interface';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  let accessToken = '';
  let refreshToken = '';

  let usersService: IUsersService;
  let permissionsService: IPermissionsService;
  let tenantsService: ITenantsService;
  let rolesService: IRolesService;
  let membersService: IMembersService;

  let isUserAvailable = false;
  const afterInit = async (moduleRef: TestingModule) => {
    usersService = await moduleRef.resolve(IUsersService);
    permissionsService = await moduleRef.resolve(IPermissionsService);
    tenantsService = await moduleRef.resolve(ITenantsService);
    rolesService = await moduleRef.resolve(IRolesService);
    membersService = await moduleRef.resolve(IMembersService);

    const userJohnDoe = await usersService.findOne({ email: johnDoe.email });
    const userJaneDoe = await usersService.findOne({ email: janeDoe.email });
    isUserAvailable = !!userJohnDoe?.id;
    if (isUserAvailable) johnDoe.id = userJohnDoe.id;
    if (!isUserAvailable) return;

    if (userJaneDoe?.id) janeDoe.id = userJaneDoe.id;

    const tenant = await tenantsService.findOne({}, { user: userJohnDoe });

    if (tenant?.id) {
      const { data: permissions } = await permissionsService.findMany({}, { user: userJohnDoe, tenant });
      const { data: roles } = await rolesService.findMany({}, { user: userJohnDoe, tenant });
      const { data: members } = await membersService.findMany({}, { user: userJohnDoe, tenant });
      const { data: membersJane } = await membersService.findMany({}, { user: userJaneDoe, tenant });


      if (Array.isArray(permissions) && permissions.length) {
        await permissionsService.remove(permissions.map((item) => item.id), {
          user: userJohnDoe, tenant,
        });
      }

      if (Array.isArray(roles) && roles.length) {
        await rolesService.remove(roles.map((item) => item.id), {
          user: userJohnDoe, tenant
        });
      }

      if (Array.isArray(members) && members.length) {
        await membersService.remove(members.map((item) => item.id), {
          user: userJohnDoe, tenant,
        });
      }

      if (Array.isArray(membersJane) && membersJane.length) {
        await membersService.remove(membersJane.map((item) => item.id), {
          user: userJaneDoe, tenant,
        });
      }

      await tenantsService.remove(tenant.id, { user: userJohnDoe });
    }

    if (userJaneDoe?.id) await usersService.remove(userJaneDoe.id);
    if (userJohnDoe?.id) await usersService.remove(userJohnDoe.id);
  }

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        AppModule,
      ],
    }).compile();
    const typeorm = await moduleFixture.resolve(TypeOrmModule);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    await app.init();
    await afterInit(moduleFixture);
  });


  afterAll(async () => {
    await moduleFixture.close();
    await app.close();
  });


  // /** keep it to skip scenarios

  it(`/ (GET): ${HttpStatus.OK}`, () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(HttpStatus.OK)
      .then((res) => {
        expect(res.body.version).toBeTruthy();
      });
  });

  /** keep it to skip scenarios */
});
