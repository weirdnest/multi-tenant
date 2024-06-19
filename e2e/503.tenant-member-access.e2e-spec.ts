import { Test, TestingModule } from '@nestjs/testing';
import { ClassSerializerInterceptor, HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Reflector } from '@nestjs/core';
import { IUsersService } from '@w7t/multi-tenant/core/users/interfaces/users-service.interface';
import { ITenantsService } from '@w7t/multi-tenant/core/tenants/interfaces/tenants-service.interface';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { janeDoe, johnDoe } from '@w7t/multi-tenant/core/users/interfaces/users.samples';
import { TenantsMessage } from '@w7t/multi-tenant/core/tenants/constants';
import { sampleTenant01, sampleTenant02 } from '@w7t/multi-tenant/core/tenants/interfaces/tenants.samples';
import { HttpStatusMessage } from '@w7t/multi-tenant/infra/exceptions/constants';
import { ITenantsRepository } from '@w7t/multi-tenant/core/tenants/interfaces/tenants-repository.interface';
import { IRolesRepository } from '@w7t/multi-tenant/core/roles/interfaces/roles-repository.interface';
import { sampleRoleMember } from '@w7t/multi-tenant/core/roles/interfaces/roles.samples';
import { AbilityMessages } from '@w7t/multi-tenant/core/abilities';

describe('Tenant member: checking permissions', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

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



  let accessToken = '';
  let refreshToken = '';
  let usersService: IUsersService;
  let roleMember = null;
  let memberJaneDoe = null;


  let tenantAccessToken = '';
  let tenantRefreshToken = '';
  let tenantsRepository: ITenantsRepository;
  let rolesRepository: IRolesRepository;
  let isTenantAvailable = false;

  const afterInit = async (moduleRef: TestingModule) => {
    usersService = await moduleRef.resolve(IUsersService);
    tenantsRepository = await moduleRef.resolve(ITenantsRepository);
    rolesRepository = await moduleRef.resolve(IRolesRepository);


    roleMember = await rolesRepository.findOne({ slug: sampleRoleMember.slug });

    const tenant01 = await tenantsRepository.findOne({ slug: sampleTenant01.slug });
    isTenantAvailable = !!tenant01?.id;
    if (isTenantAvailable) sampleTenant01.id = tenant01.id
  }

  // /** keep it to skip scenarios


  it(`/auth (POST): ${HttpStatus.CREATED}, successfull login`, () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: janeDoe.email, password: janeDoe.password })
      .expect(HttpStatus.CREATED)
      .then((res) => {
        const { access, refresh } = res.body.jwt;
        const { id: userId } = res.body.user;
        expect(userId).toBeTruthy();
        janeDoe.id = userId;
        accessToken = access;
        refreshToken = refresh;
      });
  });

  it(`/auth/tenant/:id/login (POST): ${HttpStatus.CREATED}: tenant login`, () => {
    return request(app.getHttpServer())
      .post(`/auth/tenant/${sampleTenant01.id}/login`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.CREATED)
      .then((res) => {
        expect(res.body.jwt).toEqual(expect.objectContaining({
          access: expect.any(String),
          refresh: expect.any(String),
        }));
        expect(res.body.tenant).toEqual(expect.objectContaining({
          id: sampleTenant01.id,
          name: expect.any(String),
        }));
        tenantAccessToken = res.body.jwt.access;
        tenantRefreshToken = res.body.jwt.refresh;
      });
  });

  it(`/members (GET): ${HttpStatus.OK}, should not see owner member`, () => {
    return request(app.getHttpServer())
      .get(`/members`)
      .set('Authorization', `Bearer ${tenantAccessToken}`)
      .expect(HttpStatus.OK)
      .then((res) => {
        expect(res.body.total).toEqual(1);
        const [member] = res.body.data || [];
        if (member) memberJaneDoe = member;
      });
  });

  it(`/members/{:id} (PATCH): ${HttpStatus.FORBIDDEN}, forbidden to change member roles`, () => {
    return request(app.getHttpServer())
      .patch(`/members/${memberJaneDoe.id}`)
      .set('Authorization', `Bearer ${tenantAccessToken}`)
      .send({ roles: [{ id: roleMember.id }] })
      .expect(HttpStatus.FORBIDDEN)
      .then((res) => {
        const { error } = res.body;
        expect(error.message).toEqual(AbilityMessages.FORBIDDEN);
      });
  });

  /** keep it to skip scenarios */
});