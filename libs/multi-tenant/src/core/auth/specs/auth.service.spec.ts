import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';

import { AuthMessage } from '../constants';
import { AbilityFactoryProvider, IConfigService, ServiceRequestContext } from '@w7t/multi-tenant/infra';
import { MockType, mockServiceFactory } from '@w7t/multi-tenant/infra/abstract/specs';
import { IMembersService } from '../../members/interfaces/members-service.interface';
import { sampleMember01 } from '../../members/interfaces/members.samples';
import { ITenantsService } from '../../tenants';
import { TenantsMessage } from '../../tenants/constants';
import { sampleTenant01 } from '../../tenants/interfaces/tenants.samples';
import { IUsersService, UsersMessage } from '../../users';
import { johnDoe } from '../../users/interfaces/users.samples';
import { IJwtService } from '../interfaces';
import { AbilitiesServiceProvider } from '@w7t/multi-tenant/infra/providers/abilities-service.provider';
import { mockConfigService, mockJwtService, HASHED_PASSWORD } from './auth.mocks';

jest.mock('bcrypt', () => {
  global.mockBcrypt = {
    hash: jest.fn().mockImplementation(() => 'HASHED_PASSWORD'),
    compare: jest.fn().mockImplementation(() => true),
  };
  return global.mockBcrypt;
});
const mockBcrypt = global.mockBcrypt;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: MockType<IUsersService>;
  let tenantsService: MockType<ITenantsService>;
  let membersService: MockType<IMembersService>;
  let jwtService: MockType<IJwtService>;

  const { id: tenantId } = sampleTenant01;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // LoggerProvider,
        AuthService,
        AbilityFactoryProvider,
        AbilitiesServiceProvider,
        {
          provide: IConfigService,
          useValue: mockConfigService,
        },
        {
          provide: IUsersService,
          useFactory: mockServiceFactory,
        },
        {
          provide: IJwtService,
          useValue: mockJwtService,
        },
        {
          provide: ITenantsService,
          useFactory: mockServiceFactory,
        },
        {
          provide: IMembersService,
          useFactory: mockServiceFactory,
        },
        // mockRequestContextProvider,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<IUsersService>(IUsersService) as any;
    tenantsService = module.get<ITenantsService>(ITenantsService) as any;
    membersService = module.get<IMembersService>(IMembersService) as any;
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  // /** keep it to skip scenarios
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('register: adds context, hashes password and requests service', async () => {
    const body = {
      name: johnDoe.name,
      email: johnDoe.email,
      password: johnDoe.password,
    };
    await service.register(body);
    expect(usersService.create).toHaveBeenCalledWith({
      ...body,
      password: HASHED_PASSWORD,
    });
  });

  it('login: throws error when user not found', async () => {
    usersService.findOne.mockImplementationOnce(() => null);
    const payload = { email: johnDoe.email, password: johnDoe.password };
    await expect(async () => service.login(payload)).rejects.toThrow(
      AuthMessage.UNAUTHORIZED,
    );
  });

  it('login: throws error when password does not match', async () => {
    usersService.findOne.mockImplementationOnce(() => johnDoe);
    mockBcrypt.compare.mockImplementationOnce(() => false);
    const payload = { email: johnDoe.email, password: johnDoe.password };
    await expect(async () => service.login(payload)).rejects.toThrow(
      AuthMessage.UNAUTHORIZED,
    );
  });

  it('login: throws error when user not found', async () => {
    usersService.findOne.mockImplementationOnce(() => null);
    mockBcrypt.compare.mockImplementationOnce(() => true);
    const body = { email: johnDoe.email, password: johnDoe.password };
    await expect(async () => service.login(body)).rejects.toThrow(
      AuthMessage.UNAUTHORIZED,
    );
    expect(usersService.findOne).toHaveBeenCalledTimes(1);
    expect(usersService.findOne).toHaveBeenCalledWith({ email: johnDoe.email });
  });

  it('login: success: calls services, compares password hash', async () => {
    usersService.findOne.mockClear().mockImplementationOnce(() => johnDoe);
    mockBcrypt.compare.mockImplementationOnce(() => true);
    const body = { email: johnDoe.email, password: johnDoe.password };
    await service.login(body);
    expect(usersService.findOne).toHaveBeenCalledTimes(1);
    expect(usersService.findOne).toHaveBeenCalledWith({ email: johnDoe.email });
    expect(mockBcrypt.compare).toHaveBeenCalledWith(
      johnDoe.password,
      expect.any(String),
    );
  });

  it('validateTokenPayload: false when no userId in payload', async () => {
    const result = await service.validateTokenPayload({} as any);
    expect(result).toEqual(false);
  });

  it('validateTokenPayload: false when user not found', async () => {
    usersService.findOne.mockImplementationOnce(() => null);
    const result = await service.validateTokenPayload({ userId: johnDoe.id });
    expect(result).toEqual(false);
    expect(usersService.findOne).toHaveBeenCalledTimes(1);
    expect(usersService.findOne).toHaveBeenCalledWith({ id: johnDoe.id });
  });

  it('validateTokenPayload: returns user when no tenant', async () => {
    usersService.findOne.mockImplementationOnce(() => johnDoe);
    const result = await service.validateTokenPayload({ userId: johnDoe.id });
    expect(usersService.findOne).toHaveBeenCalledTimes(1);
    expect(usersService.findOne).toHaveBeenCalledWith({ id: johnDoe.id });
    expect(result).toEqual(johnDoe);
  });

  it('validateTokenPayload: false when member not found', async () => {
    usersService.findOne.mockImplementationOnce(() => johnDoe);
    membersService.findOne.mockImplementationOnce(() => null);
    const result = await service.validateTokenPayload({
      userId: johnDoe.id,
      tenantId,
      memberId: sampleMember01.id,
    });
    expect(result).toEqual(false);
    expect(usersService.findOne).toHaveBeenCalledTimes(1);
    expect(usersService.findOne).toHaveBeenCalledWith({ id: johnDoe.id });
    expect(membersService.findOne).toHaveBeenCalledTimes(1);

    expect(membersService.findOne).toHaveBeenCalledWith(
      {
        where: {
          id: sampleMember01.id,
          tenantId,
          userId: johnDoe.id,
        },
        relations: { tenant: true, roles: { permissions: true } },
      },
      { user: johnDoe },
    );
  });

  it('validateTokenPayload: adds tenant data', async () => {
    usersService.findOne.mockImplementationOnce(() => johnDoe);
    tenantsService.findOne.mockImplementationOnce(() => sampleTenant01);
    membersService.findOne.mockImplementationOnce(() => sampleMember01);

    const result: any = await service.validateTokenPayload({
      userId: johnDoe.id,
      tenantId,
      memberId: sampleMember01.id,
    });
    expect(result.id).toEqual(johnDoe.id);
    expect(result.tenant.members[0].id).toEqual(sampleMember01.id);
    expect(usersService.findOne).toHaveBeenCalledTimes(1);
    expect(usersService.findOne).toHaveBeenCalledWith({ id: johnDoe.id });
    expect(membersService.findOne).toHaveBeenCalledTimes(1);
    expect(membersService.findOne).toHaveBeenCalledWith(
      {
        relations: { tenant: true, roles: { permissions: true } },
        where: {
          id: sampleMember01.id,
          tenantId,
          userId: johnDoe.id,
        },
      },
      { user: johnDoe },
    );
  });

  it('getJwtAccessToken: requests jwtService', () => {
    const expiresIn = '4 days';
    const secret = 'JWT_SECRET';
    mockJwtService.sign.mockClear();
    mockConfigService.get
      .mockImplementationOnce(() => secret)
      .mockImplementationOnce(() => expiresIn);

    const result = service.getJwtAccessToken(johnDoe.id, {});
    expect(mockConfigService.get).toHaveBeenCalledWith(
      'JWT_ACCESS_TOKEN_SECRET',
    );
    expect(mockConfigService.get).toHaveBeenCalledWith(
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
    );

    expect(mockJwtService.sign).toHaveBeenCalledTimes(1);
    expect(mockJwtService.sign).toHaveBeenCalledWith(
      { userId: johnDoe.id },
      {
        expiresIn,
        secret,
      },
    );
  });

  it('getJwtRefreshToken: requests jwtService', () => {
    const expiresIn = '14 days';
    const secret = 'JWT_SECRET';
    mockJwtService.sign.mockClear();
    mockConfigService.get
      .mockImplementationOnce(() => secret)
      .mockImplementationOnce(() => expiresIn);

    const result = service.getJwtRefreshToken(johnDoe.id, {});

    expect(mockConfigService.get).toHaveBeenCalledWith(
      'JWT_REFRESH_TOKEN_SECRET',
    );
    expect(mockConfigService.get).toHaveBeenCalledWith(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    );
    expect(mockJwtService.sign).toHaveBeenCalledTimes(1);
    expect(mockJwtService.sign).toHaveBeenCalledWith(
      { userId: johnDoe.id },
      {
        expiresIn,
        secret,
      },
    );
  });

  it('tenantLogin: throws error when tenantId is missing', async () => {
    await expect(
      async () =>
        await service.tenantLogin('', {
          user: johnDoe,
        } as ServiceRequestContext),
    ).rejects.toThrow(TenantsMessage.MISSING_ID);
  });

  it('tenantLogin: throws error when user is not in context', async () => {
    await expect(
      async () => await service.tenantLogin(sampleTenant01.id, {}),
    ).rejects.toThrow(UsersMessage.MISSING_CONTEXT_USER);
  });

  it('tenantLogin: throws error when member not found', async () => {
    tenantsService.findOne.mockImplementationOnce(() => sampleTenant01);
    membersService.findOne.mockImplementationOnce(() => null);
    await expect(async () =>
      service.tenantLogin(sampleTenant01.id, { user: johnDoe }),
    ).rejects.toThrow(AuthMessage.TENANT_LOGIN_FAILED);
    expect(membersService.findOne).toHaveBeenCalledTimes(1);
    expect(membersService.findOne).toHaveBeenCalledWith(
      {
        where: { tenantId: sampleTenant01.id, userId: johnDoe.id },
        relations: { tenant: true },
      },
      { user: johnDoe },
    );
  });

  it('tenantLogin: success: adds context, calls services', async () => {
    tenantsService.findOne.mockImplementationOnce(() => sampleTenant01);
    membersService.findOne.mockImplementationOnce(() => sampleMember01);

    await service.tenantLogin(sampleTenant01.id, { user: johnDoe });
    expect(membersService.findOne).toHaveBeenCalledTimes(1);
    expect(membersService.findOne).toHaveBeenCalledWith(
      {
        where: { tenantId: sampleTenant01.id, userId: johnDoe.id },
        relations: { tenant: true },
      },
      { user: johnDoe },
    );
  });

  /** keep it to skip scenarios */
});
