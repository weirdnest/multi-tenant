import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from '../permissions.service';
import { IPermissionsRepository } from '../interfaces/permissions-repository.interface';
import { samplePermission01 } from '../interfaces/permissions.samples';
import { UsersMessage } from '../../users';
import { johnDoe } from '../../users/interfaces/users.samples';
import { TenantsMessage } from '../../tenants/constants';
import { sampleTenant01 } from '../../tenants/interfaces/tenants.samples';
import { sampleMember01 } from '../../members/interfaces/members.samples';
import { PermissionsMessage } from '../constants';
import { AbilitiesServiceProvider, AbilityFactoryProvider } from '@w7t/multi-tenant/infra';
import { MockType, mockRepoFactory } from '@w7t/multi-tenant/infra/abstract/specs';
import { AbilityMessages } from '../../abilities/constants';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let mockRepo: MockType<IPermissionsRepository>;

  const entityManager = undefined;
  const { id: tenantId } = sampleTenant01;
  const permissionId = samplePermission01.id;

  const tenantWithMember = {
    ...sampleTenant01,
    members: [sampleMember01],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // LoggerProvider,
        PermissionsService,
        AbilityFactoryProvider,
        AbilitiesServiceProvider,
        {
          provide: IPermissionsRepository,
          useFactory: mockRepoFactory,
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);

    mockRepo = module.get(IPermissionsRepository);
  });

  // /** keep it to skip scenarios quicker

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create: throws error without user in context', async () => {
    const payload = { key: samplePermission01.key };
    await expect(
      async () => await service.create(payload, { tenant: tenantWithMember }),
    ).rejects.toThrow(UsersMessage.MISSING_CONTEXT_USER);
    expect(mockRepo.create).toHaveBeenCalledTimes(0);
  });

  it('create: throws error without tenant in context', async () => {
    const payload = { key: samplePermission01.key };
    await expect(
      async () => await service.create(payload, { user: johnDoe }),
    ).rejects.toThrow(TenantsMessage.MISSING_CONTEXT_TENANT);
    expect(mockRepo.create).toHaveBeenCalledTimes(0);
  });

  // it('create: forbidden without member', async () => {
  //   const payload = { key: samplePermission01.key };
  //   await expect(
  //     async () =>
  //       await service.create(payload, {
  //         user: johnDoe,
  //         tenant: sampleTenant01,
  //       }),
  //   ).rejects.toThrow(AbilityMessages.FORBIDDEN);
  //   expect(mockRepo.create).toHaveBeenCalledTimes(0);
  // });

  it('create: throws error without body.key', async () => {
    const payload = { key: '' };
    await expect(
      async () =>
        await service.create(payload, {
          user: johnDoe,
          tenant: tenantWithMember,
        }),
    ).rejects.toThrow(PermissionsMessage.PERMISSION_KEY_MISSING);
    expect(mockRepo.create).toHaveBeenCalledTimes(0);
  });

  it('create: requests repository', async () => {
    const payload = { key: samplePermission01.key };
    await service.create(payload, {
      user: johnDoe,
      tenant: tenantWithMember,
      entityManager,
    });
    expect(mockRepo.create).toHaveBeenCalledWith(
      {
        ...payload,
        tenantId,
        keyTenant: `${tenantId}-${payload.key}`,
      },
      { entityManager },
    );
  });

  it('findMany: throws error without tenant in context', async () => {
    const payload = { key: samplePermission01.key };
    await expect(
      async () => await service.findMany(payload, { user: johnDoe }),
    ).rejects.toThrow(TenantsMessage.MISSING_CONTEXT_TENANT);
    expect(mockRepo.findMany).toHaveBeenCalledTimes(0);
  });

  it('findMany: requests repository', async () => {
    const payload = { key: samplePermission01.key };
    await service.findMany(payload, {
      user: johnDoe,
      tenant: tenantWithMember,
    });
    expect(mockRepo.findMany).toHaveBeenCalledWith(payload);
  });

  it('findOne: throws error without tenant in context', async () => {
    const payload = { key: samplePermission01.key };
    await expect(
      async () => await service.findOne(payload, { user: johnDoe }),
    ).rejects.toThrow(TenantsMessage.MISSING_CONTEXT_TENANT);
    expect(mockRepo.findOne).toHaveBeenCalledTimes(0);
  });

  it('findOne: requests repository', async () => {
    const payload = { key: samplePermission01.key };
    await service.findOne(payload, { user: johnDoe, tenant: tenantWithMember });
    expect(mockRepo.findOne).toHaveBeenCalledWith(payload);
  });

  it('update: throws error without tenant in context', async () => {
    const payload = { key: samplePermission01.key };
    await expect(
      async () =>
        await service.update(samplePermission01.id, payload, { user: johnDoe }),
    ).rejects.toThrow(TenantsMessage.MISSING_CONTEXT_TENANT);
    expect(mockRepo.update).toHaveBeenCalledTimes(0);
  });

  // it('update: forbidden without member in context', async () => {
  //   const payload = { key: samplePermission01.key };
  //   await expect(
  //     async () =>
  //       await service.update(samplePermission01.id, payload, {
  //         user: johnDoe,
  //         tenant: sampleTenant01,
  //       }),
  //   ).rejects.toThrow(AbilityMessages.FORBIDDEN);
  //   expect(mockRepo.update).toHaveBeenCalledTimes(0);
  // });

  it('update: requests repository', async () => {
    const payload = { key: samplePermission01.key };
    await service.update(permissionId, payload, {
      user: johnDoe,
      tenant: tenantWithMember,
    });
    expect(mockRepo.update).toHaveBeenCalledWith(permissionId, payload);
  });

  it('remove: throws error without tenant in context', async () => {
    await expect(
      async () =>
        await service.remove(samplePermission01.id, { user: johnDoe }),
    ).rejects.toThrow(TenantsMessage.MISSING_CONTEXT_TENANT);
    expect(mockRepo.update).toHaveBeenCalledTimes(0);
  });

  // it('remove: forbidden without member in context', async () => {
  //   await expect(
  //     async () =>
  //       await service.remove(samplePermission01.id, {
  //         user: johnDoe,
  //         tenant: sampleTenant01,
  //       }),
  //   ).rejects.toThrow(AbilityMessages.FORBIDDEN);
  //   expect(mockRepo.update).toHaveBeenCalledTimes(0);
  // });

  it('remove: requests repository', async () => {
    await service.remove(permissionId, {
      user: johnDoe,
      tenant: tenantWithMember,
    });
    expect(mockRepo.remove).toHaveBeenCalledWith(permissionId);
  });

  /** keep it to skip scenarios quicker */
});
