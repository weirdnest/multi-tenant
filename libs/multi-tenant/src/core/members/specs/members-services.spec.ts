import { TestingModule, Test } from '@nestjs/testing';
import { sampleTenant01 } from '../../tenants/interfaces/tenants.samples';
import { IMembersRepository } from '../interfaces/members-repository.interface';
import { sampleMember01 } from '../interfaces/members.samples';
import { MembersService } from '../members.service';
import { TenantsMessage } from '../../tenants/constants';
import { johnDoe } from '../../users/interfaces/users.samples';
import {
  sampleRoleAdmin,
  sampleRoleMember,
} from '../../roles/interfaces/roles.samples';
import { samplePermission01 } from '../../permissions/interfaces/permissions.samples';
import {
  MockType,
  mockRepoFactory,
} from '@w7t/multi-tenant/infra/abstract/specs';
import {
  AbilitiesServiceProvider,
  AbilityFactoryProvider,
} from '@w7t/multi-tenant/infra';
import { Role } from '../../roles/entities/role';

describe('MembersService', () => {
  let service: MembersService;
  let mockRepo: MockType<IMembersRepository>;

  const entityManager = undefined;
  const { id: tenantId } = sampleTenant01;
  const memberId = sampleMember01.id;

  const tenantWithOwnerMember = {
    ...sampleTenant01,
    members: [
      {
        ...sampleMember01,
        isOwner: true,
      },
    ],
  };
  const tenantWithMember = {
    ...sampleTenant01,
    members: [
      {
        ...sampleMember01,
        isOwner: false,
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // LoggerProvider,
        MembersService,
        // CaslAbilityFactoryProvider,
        // CaslAbilityServiceProvider,
        AbilityFactoryProvider,
        AbilitiesServiceProvider,
        {
          provide: IMembersRepository,
          useFactory: mockRepoFactory,
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);

    mockRepo = module.get(IMembersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // /** keep it to skip scenarios quicker

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findMany: throws error without tenant in context', async () => {
    const payload = { tenantId: sampleMember01.tenantId };
    await expect(
      async () => await service.findMany(payload, { user: johnDoe }),
    ).rejects.toThrow(TenantsMessage.MISSING_CONTEXT_TENANT);
    expect(mockRepo.findMany).toHaveBeenCalledTimes(0);
  });

  it('findMany: owner: requests repository', async () => {
    const payload = { tenantId: sampleMember01.tenantId };
    await service.findMany(payload, {
      user: johnDoe,
      tenant: tenantWithOwnerMember,
    });
    expect(mockRepo.findMany).toHaveBeenCalledWith({
      where: {
        tenantId,
      },
    });
  });

  it('findMany: member without permissions: requests repository', async () => {
    const payload = { tenantId: sampleMember01.tenantId };
    await service.findMany(payload, {
      user: johnDoe,
      tenant: tenantWithMember,
    });
    expect(mockRepo.findMany).toHaveBeenCalledWith({
      where: {
        tenantId,
        userId: johnDoe.id,
      },
    });
  });

  it('findMany: member with permissions: requests repository', async () => {
    const payload = { tenantId: sampleMember01.tenantId };

    await service.findMany(payload, {
      user: johnDoe,
      tenant: {
        ...tenantWithMember,
        members: [
          {
            ...sampleMember01,
            isOwner: false,
            roles: [
              {
                ...sampleRoleMember,
                permissions: [samplePermission01],
              } as unknown as Role,
            ],
          },
        ],
      },
    });

    expect(mockRepo.findMany).toHaveBeenCalledWith({
      where: [
        {
          tenantId,
          roles: [{ id: sampleRoleAdmin.id }],
        },
        {
          tenantId,
          userId: johnDoe.id,
        },
      ],
    });
  });

  /** keep it to skip scenarios quicker */
});
