import { Test, TestingModule } from '@nestjs/testing';
import { ClassSerializerInterceptor, HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Reflector } from '@nestjs/core';
import { IUsersService } from '@w7t/multi-tenant/core/users/interfaces/users-service.interface';
import { ITenantsService } from '@w7t/multi-tenant/core/tenants/interfaces/tenants-service.interface';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { janeDoe } from '@w7t/multi-tenant/core/users/interfaces/users.samples';
import { sampleTenant01 } from '@w7t/multi-tenant/core/tenants/interfaces/tenants.samples';
import { HttpStatusMessage } from '@w7t/multi-tenant/infra/exceptions/constants';
import { ITenantsRepository } from '@w7t/multi-tenant/core/tenants';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  let accessToken = '';
  let refreshToken = '';
  let usersService: IUsersService;
  let isUserAvailable = false;


  let tenantAccessToken = '';
  let tenantRefreshToken = '';
  let tenantsService: ITenantsService;
  let tenantsRepository: ITenantsRepository;
  let isTenantAvailable = false;


  const afterInit = async (moduleRef: TestingModule) => {
    usersService = await moduleRef.resolve(IUsersService);
    tenantsRepository = await moduleRef.resolve(ITenantsRepository);

    const userJaneDoe = await usersService.findOne({ email: janeDoe.email });
    isUserAvailable = !!userJaneDoe?.id;
    if (isUserAvailable) janeDoe.id = userJaneDoe.id;

    // const tenant = await tenantsService.findOne({ name: sampleTenant01.name }, {
    //   user: userJaneDoe,
    // });
    const tenant = await tenantsRepository.findOne({ slug: sampleTenant01.slug });
    console.log(`501: tenant:`, tenant);
    const { id: tenantId } = tenant || {};
    if (!tenantId) throw new Error(`Tenant not found`);
    Object.assign(sampleTenant01, tenant);
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
          })
        });
        const { access, refresh } = res.body.jwt;
        accessToken = access;
        refreshToken = refresh;
      });
  });

  it(`/auth/tenant/${sampleTenant01.id}/register (POST): ${HttpStatus.UNAUTHORIZED}, not logged in`, () => {
    return request(app.getHttpServer())
      .post(`/auth/tenant/${sampleTenant01.id}/register`).send({})
      .expect(HttpStatus.UNAUTHORIZED)
      .then((res) => {
        expect(res.body).toEqual({
          error: expect.objectContaining({
            statusCode: HttpStatus.UNAUTHORIZED,
            message: HttpStatusMessage.UNAUTHORIZED,
            timestamp: expect.any(String),
            path: expect.any(String),
          }),
        });
      });
  });

  it(`/auth/tenant/${sampleTenant01.id}/register (POST): ${HttpStatus.CREATED}, register tenant member`, () => {
    return request(app.getHttpServer())
      .post(`/auth/tenant/${sampleTenant01.id}/register`).send({})
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.CREATED)
      .then((res) => {
        console.log(`501: register response:`, res.body);
        expect(res.body.email).toEqual(janeDoe.email);
        expect(res.body.isOwner).toEqual(false);
        expect(res.body.tenantId).toEqual(sampleTenant01.id);
        expect(res.body.userId).toEqual(janeDoe.id);
      });
  });
});