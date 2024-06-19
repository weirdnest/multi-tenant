import { TestingModule, Test } from '@nestjs/testing';
import { sampleTenant01 } from '../../tenants/interfaces/tenants.samples';
import { IMembersRepository } from '../interfaces/members-repository.interface';
import { sampleMember01 } from '../interfaces/members.samples';
import { MembersService } from '../members.service';
import { TenantsMessage } from '../../tenants/constants';
import { janeDoe, johnDoe } from '../../users/interfaces/users.samples';
import {
  sampleRoleAdmin,
  sampleRoleMember,
} from '../../roles/interfaces/roles.samples';
import { samplePermissionCanReadAdmin } from '../../permissions/interfaces/permissions.samples';
import {
  MockType,
  mockRepoFactory,
  mockServiceFactory,
} from '@w7t/multi-tenant/infra/abstract/specs';
import {
  AbilitiesServiceProvider,
  AbilityFactoryProvider,
} from '@w7t/multi-tenant/infra';
import { Role } from '../../roles/entities/role';
import { IRolesService } from '../../roles/interfaces/roles-service.interface';
import { UsersMessage } from '../../users';
import { IAbilitiesService } from '../../abilities';

describe('MembersService', () => {
  let service: MembersService;
  let rolesService: MockType<IRolesService>;
  let abilitiesService: MockType<IAbilitiesService>;
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
        AbilityFactoryProvider,
        AbilitiesServiceProvider,
        {
          provide: IMembersRepository,
          useFactory: mockRepoFactory,
        },
        {
          provide: IRolesService,
          useFactory: mockServiceFactory,
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    rolesService = await module.resolve(IRolesService);
    abilitiesService = await module.resolve(IAbilitiesService);
    mockRepo = module.get(IMembersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // /** keep it to skip scenarios quicker

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create: throws error without user in context', async () => {
    const payload = {
      name: sampleMember01.name,
      tenantId,
      userId: sampleMember01.userId,
    };
    await expect(
      async () => await service.create(payload, {}),
    ).rejects.toThrow(UsersMessage.MISSING_CONTEXT_USER);
    expect(mockRepo.create).toHaveBeenCalledTimes(0);
  });

  it('create: sets default role and requests repository', async () => {
    rolesService.findOne.mockImplementationOnce(() => sampleRoleMember);

    const payload = {
      name: janeDoe.name,
      tenantId,
      userId: janeDoe.id,
    };
    await service.create(payload, { user: johnDoe })
    expect(rolesService.findOne).toHaveBeenCalledWith({ tenantId, isDefault: true }, { tenant: expect.objectContaining({ id: sampleTenant01.id }) });
    expect(mockRepo.create).toHaveBeenCalledWith({
      ...payload,
      roles: [{ id: sampleRoleMember.id }]
    }, { entityManager })
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

  it('findMany: member without permissions: requests own member', async () => {
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

  it('findMany: member with permissions: requests target roles', async () => {
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
                permissions: [samplePermissionCanReadAdmin],
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
          roles: [{ id: sampleRoleMember.id }],
        },
        {
          tenantId,
          userId: johnDoe.id,
        },
      ],
    });
  });

  it('findOne: throws error without user in context', async () => {
    const payload = { tenantId: sampleMember01.tenantId };
    await expect(
      async () => await service.findOne(payload, {}),
    ).rejects.toThrow(UsersMessage.MISSING_CONTEXT_USER);
    expect(mockRepo.findOne).toHaveBeenCalledTimes(0);
  });

  it('findOne: owner: requests repository', async () => {
    const payload = { tenantId: sampleMember01.tenantId };
    await service.findOne(payload, {
      user: johnDoe,
      tenant: tenantWithOwnerMember,
    });
    expect(mockRepo.findOne).toHaveBeenCalledWith({
      where: {
        tenantId,
      },
    });
  });


  it('findOne: member without permissions: requests own member', async () => {
    const payload = { tenantId: sampleMember01.tenantId };
    await service.findOne(payload, {
      user: johnDoe,
      tenant: tenantWithMember,
    });
    expect(mockRepo.findOne).toHaveBeenCalledWith({
      where: {
        tenantId,
        userId: johnDoe.id,
      },
    });
  });

  it('findOne: member with permissions: requests target roles', async () => {
    const payload = { tenantId: sampleMember01.tenantId };

    await service.findOne(payload, {
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
                permissions: [samplePermissionCanReadAdmin],
              } as unknown as Role,
            ],
          },
        ],
      },
    });

    expect(mockRepo.findOne).toHaveBeenCalledWith({
      where: [
        {
          tenantId,
          roles: [{ id: sampleRoleMember.id }],
        },
        {
          tenantId,
          userId: johnDoe.id,
        },
      ],
    });
  });

  it('update', async () => {
    const payload = { name: johnDoe.name };
    mockRepo.find.mockImplementationOnce(() => [{
      ...sampleMember01, roles: [sampleRoleAdmin],
    }]);

    const result = await service.update(sampleMember01.id, payload, {
      user: johnDoe, tenant: {
        ...tenantWithMember,
        members: [
          {
            ...sampleMember01,
            isOwner: true,
            roles: [
              {
                ...sampleRoleMember,
                permissions: [samplePermissionCanReadAdmin],
              } as unknown as Role,
            ],
          },
        ],
      },
    });
    expect(result[0].id).toEqual(sampleMember01.id);
  });

  /** keep it to skip scenarios quicker */
});
