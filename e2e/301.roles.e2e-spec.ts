import { Test, TestingModule } from '@nestjs/testing';
import { ClassSerializerInterceptor, HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ModuleRef, Reflector } from '@nestjs/core';
import { IUsersService } from '@w7t/multi-tenant/core/users/interfaces/users-service.interface';
import { ITenantsService } from '@w7t/multi-tenant/core/tenants/interfaces/tenants-service.interface';
import { AppModule } from '../src/app.module';
import { johnDoe } from '@w7t/multi-tenant/core/users/interfaces/users.samples';
import { sampleTenant01 } from '@w7t/multi-tenant/core/tenants/interfaces/tenants.samples';
import { sampleRoleAdmin, sampleRoleMember } from '@w7t/multi-tenant/core/roles/interfaces/roles.samples';
import { Role } from '@w7t/multi-tenant/core/roles/entities/role';


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

  let isAdminRoleAvailable = false;
  let isMemberRoleAvailable = false;

  const afterInit = async (moduleRef: TestingModule) => {
    usersService = await moduleRef.resolve(IUsersService);
    tenantsService = await moduleRef.resolve(ITenantsService);

    // let user01 = await usersService.findOne({ name: johnDoe.name });
    // console.log(`afterInit:`, { user01 });
    // context.addContext(`e2e.afterInit`, { user: user01 });
    // let tenant01 = await tenantsService.findOne({ slug: sampleTenant01.slug });
    // console.log(`afterInit:`, { user01, tenant01 });
  }

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        AppModule,
      ],
    }).compile();
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

  it(`/tenants (GET): ${HttpStatus.OK}, load tenants`, () => {
    return request(app.getHttpServer())
      .get('/tenants')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK)
      .then((res) => {
        console.log(`tenants:`, res.body);
        expect(res.body.total).toEqual(expect.any(Number));
        expect(Array.isArray(res.body.data)).toEqual(true);
        const [tenant] = res.body.data;
        const { id: tenantId } = tenant;
        sampleTenant01.id = tenantId;
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


  it(`/roles (GET): ${HttpStatus.OK}: list tenant roles`, () => {
    const url = `/roles`;
    return request(app.getHttpServer())
      .get(url)
      .set('Authorization', `Bearer ${tenantAccessToken}`)
      .expect(HttpStatus.OK)
      .then((res) => {
        expect(res.body.total).toEqual(expect.any(Number));
        const roles = res.body.data;
        roles.forEach((role: Role) => {
          if (role.slug === sampleRoleAdmin.slug) {
            isAdminRoleAvailable = true;
            sampleRoleAdmin.id = role.id;
          } else if (role.slug === sampleRoleMember.slug) {
            isMemberRoleAvailable = true;
            sampleRoleMember.id = role.id;
          }
        });
      });
  });


  it(`/roles (POST): ${HttpStatus.CREATED}: create tenant role: ${sampleRoleAdmin.name} (skipped if available)`, () => {
    if (isAdminRoleAvailable) return;
    const url = `/roles`;
    return request(app.getHttpServer())
      .post(url)
      .send({ name: sampleRoleAdmin.name, isDefault: sampleRoleAdmin.isDefault })
      .set('Authorization', `Bearer ${tenantAccessToken}`)
      .expect(HttpStatus.CREATED)
      .then((res) => {
        expect(res.body).toEqual(expect.objectContaining({
          id: expect.any(String),
          tenantId: sampleTenant01.id,
          name: sampleRoleAdmin.name,
          slug: sampleRoleAdmin.slug,
          isDefault: sampleRoleAdmin.isDefault,
        }));
        const { id: roleId } = res.body.data || {};
        if (roleId) {
          isAdminRoleAvailable = true;
          sampleRoleAdmin.id = roleId;
        }
      });
  });

  it(`/roles (POST): ${HttpStatus.CREATED}: create tenant role: ${sampleRoleMember.name} (skipped if available)`, () => {
    if (isMemberRoleAvailable) return;
    const url = `/roles`;
    return request(app.getHttpServer())
      .post(url)
      .send({ name: sampleRoleMember.name, isDefault: sampleRoleMember.isDefault })
      .set('Authorization', `Bearer ${tenantAccessToken}`)
      .expect(HttpStatus.CREATED)
      .then((res) => {
        expect(res.body).toEqual(expect.objectContaining({
          id: expect.any(String),
          tenantId: sampleTenant01.id,
          name: sampleRoleMember.name,
          slug: sampleRoleMember.slug,
          isDefault: sampleRoleMember.isDefault,
        }));
        const { id: roleId } = res.body.data || {};
        if (roleId) {
          isMemberRoleAvailable = true;
          sampleRoleMember.id = roleId;
        }
      });
  });

  it(`/permissions (GET): ${HttpStatus.CREATED}: loads permissions`, () => {
    const url = `/permissions`;
    return request(app.getHttpServer())
      .get(url)
      .set('Authorization', `Bearer ${tenantAccessToken}`)
      .expect(HttpStatus.OK)
      .then((res) => {
        console.log(`301: body:`, res.body);
        expect(res.body.total).toEqual(4);

        expect(res.body.data).toEqual(expect.arrayContaining([
          expect.objectContaining({
            key: 'can_read_member_member'
          }),
          expect.objectContaining({
            key: 'can_manage_member_member'
          }),
          expect.objectContaining({
            key: 'can_read_member_administrator'
          }),
          expect.objectContaining({
            key: 'can_manage_member_administrator'
          }),
        ]));

      });
  });

  /** keep it to skip scenarios */
});