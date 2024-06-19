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
import { IMembersService } from '@w7t/multi-tenant/core/members/interfaces/members-service.interface';

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
  let membersService: IMembersService;
  let isUserAvailable = false;


  let tenantAccessToken = '';
  let tenantRefreshToken = '';
  let tenantsService: ITenantsService;
  let isTenantAvailable = false;
  let memberOfOtherTenant = null;

  const afterInit = async (moduleRef: TestingModule) => {
    usersService = await moduleRef.resolve(IUsersService);
    tenantsService = await moduleRef.resolve(ITenantsService);
    membersService = await moduleRef.resolve(IMembersService);

    const userJaneDoe = await usersService.findOne({ email: janeDoe.email });
    isUserAvailable = !!userJaneDoe?.id;
    if (isUserAvailable) janeDoe.id = userJaneDoe.id;

    const tenant02 = await tenantsService.findOne({ slug: sampleTenant02.slug }, { user: userJaneDoe });
    isTenantAvailable = !!tenant02?.id;
    if (isTenantAvailable) sampleTenant02.id = tenant02.id


    const userJohnDoe = await usersService.findOne({ email: johnDoe.email });
    const { data: otherTenants } = await tenantsService.findMany({}, { user: userJohnDoe });
    const [otherTenant] = otherTenants || [];
    console.log(`otherTenant:`, otherTenant);
    if (otherTenant?.id) {
      sampleTenant01.id = otherTenant.id;
      const { data: membersOfOtherTenant } = await membersService.findMany({}, { user: userJohnDoe, tenant: otherTenant });
      const [member] = membersOfOtherTenant || [];
      if (member?.id) memberOfOtherTenant = member;
      console.log(`membersOfOtherTenant:`, membersOfOtherTenant);
    }
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


  it(`/auth/tenant/:id/login (POST): ${HttpStatus.CREATED}: tenant login`, () => {
    return request(app.getHttpServer())
      .post(`/auth/tenant/${sampleTenant02.id}/login`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.CREATED)
      .then((res) => {
        expect(res.body.jwt).toEqual(expect.objectContaining({
          access: expect.any(String),
          refresh: expect.any(String),
        }));
        expect(res.body.tenant).toEqual(expect.objectContaining({
          id: sampleTenant02.id,
          name: expect.any(String),
        }));
        tenantAccessToken = res.body.jwt.access;
        tenantRefreshToken = res.body.jwt.refresh;
      });
  });

  it(`/members (GET): ${HttpStatus.OK}: finds tenant members`, () => {
    return request(app.getHttpServer())
      .get(`/members`)
      .set('Authorization', `Bearer ${tenantAccessToken}`)
      .expect(HttpStatus.OK)
      .then((res) => {
        console.log(`602: get members response:`, res.body);
      });
  });

  it(`/members/{:id} (GET): ${HttpStatus.FORBIDDEN}: tries to find member of other tenant as user`, () => {
    return request(app.getHttpServer())
      .get(`/members/${memberOfOtherTenant.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.FORBIDDEN);
  });


  it(`/members/{:id} (GET): ${HttpStatus.FORBIDDEN}: tries to find member of other tenant as user`, () => {
    return request(app.getHttpServer())
      .get(`/members/${memberOfOtherTenant.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.FORBIDDEN);
  });

  it(`/members/{:id} (GET): ${HttpStatus.FORBIDDEN}: tries to update member of other tenant as user`, () => {
    return request(app.getHttpServer())
      .patch(`/members/${memberOfOtherTenant.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: johnDoe.name })
      .expect(HttpStatus.FORBIDDEN);
  });

  it(`/members/{:id} (DELETE): ${HttpStatus.FORBIDDEN}: tries to remove member of other tenant as user`, () => {
    return request(app.getHttpServer())
      .get(`/members/${memberOfOtherTenant.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.FORBIDDEN);
  });


  it(`/members/{:id} (GET): ${HttpStatus.NOT_FOUND}: tries to find member of other tenant as member`, () => {
    return request(app.getHttpServer())
      .get(`/members/${memberOfOtherTenant.id}`)
      .set('Authorization', `Bearer ${tenantAccessToken}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it(`/members/{:id} (GET): ${HttpStatus.NOT_FOUND}: tries to update member of other tenant as member`, () => {
    return request(app.getHttpServer())
      .patch(`/members/${memberOfOtherTenant.id}`)
      .set('Authorization', `Bearer ${tenantAccessToken}`)
      .send({ name: johnDoe.name })
      .expect(HttpStatus.NOT_FOUND);
  });

  it(`/members/{:id} (DELETE): ${HttpStatus.NOT_FOUND}: tries to remove member of other tenant as member`, () => {
    return request(app.getHttpServer())
      .get(`/members/${memberOfOtherTenant.id}`)
      .set('Authorization', `Bearer ${tenantAccessToken}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  /** keep it to skip scenarios */
});