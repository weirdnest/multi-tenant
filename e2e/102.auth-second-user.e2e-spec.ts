import { Test, TestingModule } from '@nestjs/testing';
import { ClassSerializerInterceptor, HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IUsersService } from '@w7t/multi-tenant/core/users/interfaces/users-service.interface';
import { janeDoe } from '@w7t/multi-tenant/core/users/interfaces/users.samples';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  let accessToken = '';
  let refreshToken = '';

  let usersService: IUsersService;
  let isUserAvailable = false;
  const afterInit = async (moduleRef: TestingModule) => {
    usersService = await moduleRef.resolve(IUsersService);

    const userJaneDoe = await usersService.findOne({ email: janeDoe.email });
    isUserAvailable = !!userJaneDoe?.id;
    if (isUserAvailable) janeDoe.id = userJaneDoe.id;
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

  it(`/register (POST): ${HttpStatus.CREATED}, registration (skipped if user exists)`, () => {
    if (isUserAvailable) return;
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: ` ${janeDoe.name} `, email: janeDoe.email, password: janeDoe.password })
      .expect(HttpStatus.CREATED)
      .then((res) => {
        expect(res.body.email).toEqual(janeDoe.email);
        expect(res.body.name).toEqual(janeDoe.name);
        expect(res.body.password).toBeFalsy();
      });
  });

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


  it(`/auth (GET): ${HttpStatus.OK} with token`, () => {
    return request(app.getHttpServer())
      .get('/auth')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK)
      .then((res) => {
        expect(res.body).toEqual({
          id: expect.any(String),
          name: expect.any(String),
          email: janeDoe.email,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });
      });
  });


  /** keep it to skip scenarios */
});
