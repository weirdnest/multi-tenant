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

    const userJohnDoe = await usersService.findOne({ email: johnDoe.email });

    roleMember = await rolesRepository.findOne({ slug: sampleRoleMember.slug });

    const userJaneDoe = await usersService.findOne({ email: janeDoe.email });

    // const tenant01 = await tenantsService.findOne({ slug: sampleTenant01.slug }, { user: userJohnDoe });

    const tenant01 = await tenantsRepository.findOne({ slug: sampleTenant01.slug });
    isTenantAvailable = !!tenant01?.id;
    if (isTenantAvailable) sampleTenant01.id = tenant01.id
    console.log(`502: tenant01:`, { tenant01, userJohnDoe, roleMember })
  }

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


  it(`/members (GET): ${HttpStatus.OK}, finds list of members`, () => {
    return request(app.getHttpServer())
      .get(`/members`)
      .set('Authorization', `Bearer ${tenantAccessToken}`)
      .expect(HttpStatus.OK)
      .then((res) => {
        expect(res.body.total).toEqual(2);
        const { data } = res.body || {};
        if (data && Array.isArray(data)) {
          data.forEach((member) => {
            if (member.name === janeDoe.name) {
              memberJaneDoe = member;
            }
          })
        }
        console.log(`502: memberJaneDoe:`, memberJaneDoe);
      });
  });

  it(`/members/{:id} (PATCH): ${HttpStatus.OK}, adds member role`, () => {
    return request(app.getHttpServer())
      .patch(`/members/${memberJaneDoe.id}`)
      .set('Authorization', `Bearer ${tenantAccessToken}`)
      .send({ roles: [{ id: roleMember.id }] })
      .then((res) => {
        console.log(`502: add role response:`, res.body[0].roles);
        // expect(res.body[0].id).toEqual(memberJaneDoe.id);
        // expect(res.body[0].roles[0].id).toEqual(roleMember.id);
      });
  })

  it(`/members/{:id} (GET): ${HttpStatus.OK}, finds updated member`, () => {
    return request(app.getHttpServer())
      .get(`/members/${memberJaneDoe.id}`)
      .set('Authorization', `Bearer ${tenantAccessToken}`)
      .expect(HttpStatus.OK)
      .then((res) => {
        const member = res.body;
        expect(member.id).toEqual(memberJaneDoe.id);
        expect(member.roles[0].id).toEqual(roleMember.id);
      });
  });

  /** keep it to skip scenarios */
});
