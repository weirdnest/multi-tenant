import { Test, TestingModule } from '@nestjs/testing';
import { ClassSerializerInterceptor, HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IUsersService } from '@w7t/multi-tenant/core/users/interfaces/users-service.interface';
import { johnDoe } from '@w7t/multi-tenant/core/users/interfaces/users.samples';
import { HttpStatusMessage } from '@w7t/multi-tenant/infra/exceptions/constants';
import { AuthMessage } from '@w7t/multi-tenant/app/auth/constants';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  let accessToken = '';
  let refreshToken = '';

  let usersService: IUsersService;
  let isUserAvailable = false;
  const afterInit = async (moduleRef: TestingModule) => {
    usersService = await moduleRef.resolve(IUsersService);

    const userJohnDoe = await usersService.findOne({ email: johnDoe.email });
    isUserAvailable = !!userJohnDoe?.id;
    if (isUserAvailable) johnDoe.id = userJohnDoe.id;

    if (process.env.E2E_REMOVE_RESOURCES) {
      // if (userJohnDoe) {
      //   console.warn(`e2e: removing johnDoe`);
      //   await usersService.remove(userJohnDoe.id);
      // }
      // isUserAvailable = false;
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

  it(`/register (POST): ${HttpStatus.BAD_REQUEST}, no body.email`, () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: johnDoe.name, email: undefined, password: johnDoe.password })
      .expect(HttpStatus.BAD_REQUEST)
      .then((res) => {
        expect(res.body).toEqual(expect.objectContaining({
          error: expect.objectContaining({
            statusCode: HttpStatus.BAD_REQUEST,
            message: [AuthMessage.EMAIL_FORMAT_ERROR],
            timestamp: expect.any(String),
            path: expect.any(String),
          }),
        }));
      });
  });


  it(`/register (POST): ${HttpStatus.BAD_REQUEST}, no body.password`, async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: johnDoe.name, email: johnDoe.email, password: undefined })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(expect.objectContaining({
      error: expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: [AuthMessage.PASSWORD_FORMAT_ERROR, AuthMessage.PASSWORD_TYPE_ERROR],
        timestamp: expect.any(String),
        path: expect.any(String),
      }),
    }));
  });

  it(`/register (POST): ${HttpStatus.BAD_REQUEST}, empty body.password`, async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: johnDoe.name, email: johnDoe.email, password: '' })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(expect.objectContaining({
      error: expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: [AuthMessage.PASSWORD_FORMAT_ERROR],
        timestamp: expect.any(String),
        path: expect.any(String),
      }),
    }));
  });

  it(`/register (POST): ${HttpStatus.BAD_REQUEST}, empty body.name`, async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: undefined, email: johnDoe.email, password: johnDoe.password })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body).toEqual(expect.objectContaining({
      error: expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: [AuthMessage.NAME_EMPTY_ERROR, AuthMessage.NAME_TYPE_ERROR],
        timestamp: expect.any(String),
        path: expect.any(String),
      }),
    }));
  });

  it(`/auth (GET): ${HttpStatus.UNAUTHORIZED} with no token`, () => {
    return request(app.getHttpServer())
      .get('/auth')
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

  it(`/register (POST): ${HttpStatus.CREATED}, registration (skipped if user exists)`, () => {
    if (isUserAvailable) return;
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: ` ${johnDoe.name} `, email: johnDoe.email, password: johnDoe.password })
      .expect(HttpStatus.CREATED)
      .then((res) => {
        // console.log(`101: registration response:`, res.body);
        expect(res.body.email).toEqual(johnDoe.email);
        expect(res.body.name).toEqual(johnDoe.name);
        expect(res.body.password).toBeFalsy();
      });
  });



  it(`/auth/login (POST): ${HttpStatus.UNAUTHORIZED} without email`, () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: undefined, password: johnDoe.password })
      .expect(HttpStatus.BAD_REQUEST)
      .then((res) => {
        expect(res.body).toEqual({
          error: expect.objectContaining({
            statusCode: HttpStatus.BAD_REQUEST,
            message: [AuthMessage.EMAIL_FORMAT_ERROR],
            timestamp: expect.any(String),
            path: expect.any(String),
          }),
        });
      });
  });


  it(`/auth/login (POST): ${HttpStatus.UNAUTHORIZED} without password`, () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: johnDoe.email, password: undefined })
      .expect(HttpStatus.BAD_REQUEST)
      .then((res) => {

        expect(res.body).toEqual({
          error: expect.objectContaining({
            statusCode: HttpStatus.BAD_REQUEST,
            message: [AuthMessage.PASSWORD_FORMAT_ERROR, AuthMessage.PASSWORD_TYPE_ERROR],
            timestamp: expect.any(String),
            path: expect.any(String),
          }),
        });
      });
  });

  it(`/auth/login (POST): ${HttpStatus.UNAUTHORIZED} with wrong credentials`, () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: johnDoe.email, password: johnDoe.password + 'wrong' })
      .expect(HttpStatus.UNAUTHORIZED)
      .then((res) => {
        expect(res.body).toEqual({
          error: expect.objectContaining({
            statusCode: HttpStatus.UNAUTHORIZED,
            message: AuthMessage.UNAUTHORIZED,
            timestamp: expect.any(String),
            path: expect.any(String),
          }),
        });
      });
  });


  it(`/auth/login (POST): ${HttpStatus.CREATED}, successfull login`, () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: johnDoe.email, password: johnDoe.password })
      .expect(HttpStatus.CREATED)
      .then((res) => {
        expect(res.body).toEqual({
          jwt: expect.objectContaining({
            access: expect.any(String),
            refresh: expect.any(String),
          }),
          user: expect.objectContaining({
            id: expect.any(String),
            name: johnDoe.name,
            email: johnDoe.email,
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
        // console.log(`101: auth response:`, res.body);
        expect(res.body).toEqual({
          id: expect.any(String),
          name: expect.any(String),
          email: johnDoe.email,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        });
      });
  });


  it(`/register (POST): ${HttpStatus.CONFLICT}, already registered email`, () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: johnDoe.name, email: johnDoe.email, password: johnDoe.password })
      .expect(HttpStatus.CONFLICT)
      .then((res) => {
        expect(res.body).toEqual(expect.objectContaining({
          error: expect.objectContaining({
            statusCode: HttpStatus.CONFLICT,
            message: `Key (email)=(${johnDoe.email}) already exists.`,
            timestamp: expect.any(String),
            path: expect.any(String),
          }),
        }));
      });
  });

  /** keep it to skip scenarios */
});
