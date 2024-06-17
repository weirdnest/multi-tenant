import { Test, TestingModule } from '@nestjs/testing';
import { ClassSerializerInterceptor, HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Reflector } from '@nestjs/core';
import { IUsersService } from '@w7t/multi-tenant/core/users/interfaces/users-service.interface';
import { ITenantsService } from '@w7t/multi-tenant/core/tenants/interfaces/tenants-service.interface';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { johnDoe } from '@w7t/multi-tenant/core/users/interfaces/users.samples';
import { TenantsMessage } from '@w7t/multi-tenant/core/tenants/constants';
import { sampleTenant01 } from '@w7t/multi-tenant/core/tenants/interfaces/tenants.samples';
import { HttpStatusMessage } from '@w7t/multi-tenant/infra/exceptions/constants';

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
  let isTenantAvailable = false;


  const afterInit = async (moduleRef: TestingModule) => {
    usersService = await moduleRef.resolve(IUsersService);
    tenantsService = await moduleRef.resolve(ITenantsService);
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

  it(`/auth (POST): ${HttpStatus.CREATED}, successfull login`, () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: johnDoe.email, password: johnDoe.password })
      .expect(HttpStatus.CREATED)
      .then((res) => {
        const { access, refresh } = res.body.jwt;
        const { id: userId } = res.body.user;
        expect(userId).toBeTruthy();
        johnDoe.id = userId;
        accessToken = access;
        refreshToken = refresh;
      });
  });

  it(`/tenants (GET): ${HttpStatus.OK}: finds tenants`, () => {
    console.log(`e2e:`, { accessToken })
    return request(app.getHttpServer())
      .get(`/tenants`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK)
      .then((res) => {
        console.log(`response:`, res.body);
      });
  });

  it(`/tenants (POST): ${HttpStatus.BAD_REQUEST}: ${TenantsMessage.NAME_TYPE_ERROR}: undefined name`, () => {
    return request(app.getHttpServer())
      .post('/tenants')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(HttpStatus.BAD_REQUEST)
      .then((res) => {
        expect(res.body).toEqual(expect.objectContaining({
          error: expect.objectContaining({
            statusCode: HttpStatus.BAD_REQUEST,
            message: [TenantsMessage.NAME_EMPTY_ERROR, TenantsMessage.NAME_TYPE_ERROR],
            timestamp: expect.any(String),
            path: expect.any(String),
          }),
        }));
      });
  });

  it(`/tenants (POST): ${HttpStatus.BAD_REQUEST}: ${TenantsMessage.NAME_EMPTY_ERROR}: only spaces in name`, () => {
    return request(app.getHttpServer())
      .post('/tenants')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: '    ' })
      .expect(HttpStatus.BAD_REQUEST)
      .then((res) => {
        expect(res.body).toEqual(expect.objectContaining({
          error: expect.objectContaining({
            statusCode: HttpStatus.BAD_REQUEST,
            message: [TenantsMessage.NAME_EMPTY_ERROR],
            timestamp: expect.any(String),
            path: expect.any(String),
          }),
        }));
      });
  });


  it(`/tenants (POST): ${HttpStatus.CREATED}: creates tenant (skipped if available)`, () => {
    if (isTenantAvailable) return;

    return request(app.getHttpServer())
      .post('/tenants')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: ` ${sampleTenant01.name} ` })
      .expect(HttpStatus.CREATED)
      .then((res) => {
        expect(res.body.id).toEqual(expect.any(String));
        expect(res.body.id).toBeTruthy();
        const tenantId = res.body.id;
        sampleTenant01.id = tenantId;

        expect(res.body.name).toEqual(sampleTenant01.name);
        expect(res.body.members[0].isOwner).toEqual(true);
        expect(res.body.members[0].tenantId).toEqual(tenantId);
        expect(res.body.members[0].userId).toEqual(johnDoe.id);
        sampleTenant01.id = res.body.id;
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

  it(`/auth/tenant (GET): ${HttpStatus.OK}: tenant login check`, () => {
    const url = `/auth/tenant`;
    return request(app.getHttpServer())
      .get(url)
      .set('Authorization', `Bearer ${tenantAccessToken}`)
      .expect(HttpStatus.OK)
      .then((res) => {
        console.log(`e2e: response:`, res.body);
        expect(res.body.tenant.id).toEqual(sampleTenant01.id);
        expect(res.body.user.id).toEqual(johnDoe.id);
      });
  });

  it(`/tenants/:id (GET): ${HttpStatus.OK}: finds tenant`, () => {
    return request(app.getHttpServer())
      .get(`/tenants/${sampleTenant01.id}`)
      .set('Authorization', `Bearer ${tenantAccessToken}`)
      .expect(HttpStatus.OK)
      .then((res) => {
        console.log(`response:`, res.body);
        expect(res.body).toEqual(expect.objectContaining({
          id: expect.any(String),
          name: sampleTenant01.name,
        }));
      });
  });

  it(`/auth/tenant (GET): ${HttpStatus.UNAUTHORIZED} with no token`, () => {
    return request(app.getHttpServer())
      .get(`/auth/tenant`)
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

  /** keep it to skip scenarios */
});