import { Test, TestingModule } from '@nestjs/testing';
import { ClassSerializerInterceptor, HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IUsersService } from '@w7t/multi-tenant/core/users/interfaces/users-service.interface';
import { janeDoe, johnDoe } from '@w7t/multi-tenant/core/users/interfaces/users.samples';
import { IPermissionsService } from '@w7t/multi-tenant/core/permissions/interfaces/permissions-service.interface';
import { ITenantsRepository, ITenantsService } from '@w7t/multi-tenant/core/tenants';
import { IRolesService } from '@w7t/multi-tenant/core/roles/interfaces/roles-service.interface';
import { IMembersService } from '@w7t/multi-tenant/core/members/interfaces/members-service.interface';
import { IUsersRepository } from '@w7t/multi-tenant/core/users';
import { IPermissionsRepository } from '@w7t/multi-tenant/core/permissions/interfaces/permissions-repository.interface';
import { IRolesRepository } from '@w7t/multi-tenant/core/roles/interfaces/roles-repository.interface';
import { IMembersRepository } from '@w7t/multi-tenant/core/members/interfaces/members-repository.interface';

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

  let usersRepository: IUsersRepository;
  let permissionsRepository: IPermissionsRepository;
  let tenantsRepository: ITenantsRepository;
  let rolesRepository: IRolesRepository;
  let membersRepository: IMembersRepository;

  let isUserAvailable = false;
  const afterInit = async (moduleRef: TestingModule) => {
    usersRepository = await moduleRef.resolve(IUsersRepository);
    permissionsRepository = await moduleRef.resolve(IPermissionsRepository);
    tenantsRepository = await moduleRef.resolve(ITenantsRepository);
    rolesRepository = await moduleRef.resolve(IRolesRepository);
    membersRepository = await moduleRef.resolve(IMembersRepository);

    const permissions = await permissionsRepository.find();
    if (permissions && permissions.length) {
      await permissionsRepository.remove(permissions.map((item) => item.id));
    }
    const roles = await rolesRepository.find();
    if (roles && roles.length) {
      await rolesRepository.remove(roles.map((item) => item.id));
    }

    const members = await membersRepository.find()
    if (members && members.length) {
      await membersRepository.remove(members.map((item) => item.id));
    }

    const tenants = await tenantsRepository.find();
    if (tenants && tenants.length) {
      await tenantsRepository.remove(tenants.map((item) => item.id));
    }

    const users = await usersRepository.find();
    if (users && users.length) {
      await usersRepository.remove(users.map((item) => item.id));
    }
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
