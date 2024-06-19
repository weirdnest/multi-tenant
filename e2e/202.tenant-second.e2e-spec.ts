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
import { sampleTenant02 } from '@w7t/multi-tenant/core/tenants/interfaces/tenants.samples';
import { HttpStatusMessage } from '@w7t/multi-tenant/infra/exceptions/constants';

describe('AppController (e2e)', () => {
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
  let isUserAvailable = false;


  let tenantAccessToken = '';
  let tenantRefreshToken = '';
  let tenantsService: ITenantsService;
  let isTenantAvailable = false;

  const afterInit = async (moduleRef: TestingModule) => {
    usersService = await moduleRef.resolve(IUsersService);
    tenantsService = await moduleRef.resolve(ITenantsService);

    const userJaneDoe = await usersService.findOne({ email: janeDoe.email });
    isUserAvailable = !!userJaneDoe?.id;
    if (isUserAvailable) janeDoe.id = userJaneDoe.id;

    const tenant02 = await tenantsService.findOne({ slug: sampleTenant02.slug }, { user: userJaneDoe });
    isTenantAvailable = !!tenant02?.id;
    if (isTenantAvailable) sampleTenant02.id = tenant02.id
  }

  // /** keep it to skip scenarios


  it(`/auth/login (POST): ${HttpStatus.CREATED}, successfull login`, () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: janeDoe.email, password: janeDoe.password })
      .expect(HttpStatus.CREATED)
      .then((res) => {
        expect(res.body).toEqual({
          jwt: expect.objectContaining({
            access: expect.any(String),
            refresh: expect.any(String),
          }),
          user: expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          })
        });
        const { access, refresh } = res.body.jwt;
        accessToken = access;
        refreshToken = refresh;
      });
  });


  it(`/tenants (POST): ${HttpStatus.CREATED}: creates tenant (skipped if available)`, () => {
    if (isTenantAvailable) return;

    return request(app.getHttpServer())
      .post('/tenants')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: ` ${sampleTenant02.name} ` })
      .expect(HttpStatus.CREATED)
      .then((res) => {
        expect(res.body.id).toEqual(expect.any(String));
        expect(res.body.id).toBeTruthy();
        const tenantId = res.body.id;
        sampleTenant02.id = tenantId;

        expect(res.body.name).toEqual(sampleTenant02.name);
        expect(res.body.members[0].isOwner).toEqual(true);
        expect(res.body.members[0].tenantId).toEqual(tenantId);
        expect(res.body.members[0].userId).toEqual(janeDoe.id);
      });
  });

  it(`/tenants/{:id} (GET): ${HttpStatus.OK}: finds tenant`, () => {
    return request(app.getHttpServer())
      .get(`/tenants/${sampleTenant02.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK)
      .then((res) => {
        expect(res.body.id).toEqual(sampleTenant02.id);
        expect(res.body.name).toEqual(sampleTenant02.name);
      });
  });


  /** keep it to skip scenarios */
});