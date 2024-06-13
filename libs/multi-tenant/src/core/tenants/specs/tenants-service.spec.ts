import { Test, TestingModule } from '@nestjs/testing';
import { TenantsService } from '../tenants.service';
import { ITenantsRepository } from '../interfaces/tenants-repository.interface';
import { sampleTenant01 } from '../interfaces/tenants.samples';
import { johnDoe } from '../../users/interfaces/users.samples';
import { IMembersService } from '../../members/interfaces/members-service.interface';
import { sampleMember01 } from '../../members/interfaces/members.samples';
import * as slug from 'slug';
import { UsersMessage } from '../../users';
import { TenantsMessage } from '../constants';
import { MockType, mockRepoFactory, mockServiceFactory } from '@w7t/multi-tenant/infra/abstract/specs';

describe('TenantsService', () => {
  let service: TenantsService;
  let mockRepo: MockType<ITenantsRepository>;
  let membersService: MockType<IMembersService>;

  const tenantId = sampleTenant01.id;
  const entityManager = undefined;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // LoggerProvider,
        TenantsService,
        {
          provide: ITenantsRepository,
          useFactory: mockRepoFactory,
        },
        {
          provide: IMembersService,
          useFactory: mockServiceFactory,
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    membersService = module.get(IMembersService);

    mockRepo = module.get(ITenantsRepository);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  // /** keep it to skip scenarios quicker

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create: throws error without user in context', async () => {
    const payload = { name: sampleTenant01.name };

    await expect(async () => service.create(payload, {})).rejects.toThrow(
      UsersMessage.MISSING_CONTEXT_USER,
    );
  });

  it('create: throws error with tenant in context', async () => {
    const payload = { name: sampleTenant01.name };

    await expect(async () =>
      service.create(payload, { user: johnDoe, tenant: sampleTenant01 }),
    ).rejects.toThrow(TenantsMessage.NOT_ALLOWED_TO_CREATE_TENANT);
  });

  it('create: requests repository, creates member', async () => {
    const payload = { name: sampleTenant01.name };
    mockRepo.findOne.mockImplementationOnce(() => undefined);
    mockRepo.create.mockImplementationOnce(() => sampleTenant01);
    membersService.create.mockImplementationOnce(() => sampleMember01);

    await service.create(payload, { user: johnDoe, entityManager });
    expect(mockRepo.create).toHaveBeenCalledWith(
      {
        ...payload,
        slug: slug(payload.name),
      },
      { entityManager },
    );
    expect(membersService.create).toHaveBeenCalledWith(
      {
        userId: johnDoe.id,
        name: johnDoe.name,
        email: johnDoe.email,
        tenantId,
        isOwner: true,
      },
      { user: johnDoe, tenant: sampleTenant01, entityManager },
    );
  });

  it('findMany: throws error without user', async () => {
    const payload = { name: sampleTenant01.name };
    await expect(
      async () => await service.findMany(payload, {}),
    ).rejects.toThrow(UsersMessage.MISSING_CONTEXT_USER);
    expect(mockRepo.findMany).toHaveBeenCalledTimes(0);
  });

  it('findMany: requests repository', async () => {
    const payload = { name: sampleTenant01.name };
    await service.findMany(payload, { user: johnDoe });
    expect(mockRepo.findMany).toHaveBeenCalledWith({
      where: {
        ...payload,
        members: { userId: johnDoe.id },
      },
    });
  });

  it('findOne: throws error without user in context', async () => {
    const payload = { name: sampleTenant01.name };
    await expect(
      async () => await service.findOne(payload, {}),
    ).rejects.toThrow(UsersMessage.MISSING_CONTEXT_USER);
    expect(mockRepo.findOne).toHaveBeenCalledTimes(0);
  });

  it('findOne: requests repository', async () => {
    const payload = { name: sampleTenant01.name };
    await service.findOne(payload, { user: johnDoe });
    expect(mockRepo.findOne).toHaveBeenCalledWith(payload);
  });

  it('update: throws error without user in context', async () => {
    const payload = { name: sampleTenant01.name };
    await expect(
      async () => await service.update(tenantId, payload, {}),
    ).rejects.toThrow(UsersMessage.MISSING_CONTEXT_USER);
    expect(mockRepo.update).toHaveBeenCalledTimes(0);
  });

  it('update: requests repository', async () => {
    const payload = { name: 'abc' };
    await service.update(tenantId, payload, { user: johnDoe });
    expect(mockRepo.update).toHaveBeenCalledWith(tenantId, payload);
  });

  it('remove: requests repository', async () => {
    await service.remove(tenantId, { user: johnDoe, tenant: sampleTenant01 });
    expect(mockRepo.remove).toHaveBeenCalledWith(tenantId);
  });

  /** keep it to skip scenarios quicker */
});
