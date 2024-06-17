import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from '../roles.service';
import { Role } from '../entities/role';
import { IRolesRepository } from '../interfaces/roles-repository.interface';
import { sampleRoleAdmin } from '../interfaces/roles.samples';
import { UsersMessage } from '../../users';
import { johnDoe } from '../../users/interfaces/users.samples';
import { TenantsMessage } from '../../tenants/constants';
import { sampleTenant01 } from '../../tenants/interfaces/tenants.samples';
import { RolesMessage } from '../constants';
import { IPermissionsService } from '../../permissions/interfaces/permissions-service.interface';
import { sampleMember01 } from '../../members/interfaces/members.samples';
import {
  AbilityFactoryProvider,
  AbilitiesServiceProvider,
} from '@w7t/multi-tenant/infra';
import {
  MockType,
  mockRepoFactory,
  mockServiceFactory,
} from '@w7t/multi-tenant/infra/abstract/specs';
import { AbilityAction } from '../../abilities/constants';

describe('RolesService', () => {
  let service: RolesService;
  let permissionsService: MockType<IPermissionsService>;
  let mockRepo: MockType<IRolesRepository>;
  const { id: tenantId } = sampleTenant01;
  const tenantWithMember = {
    ...sampleTenant01,
    members: [sampleMember01],
  };
  const entityManager = undefined;
  const roleId = sampleRoleAdmin.id;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // LoggerProvider,
        AbilityFactoryProvider,
        AbilitiesServiceProvider,

        RolesService,
        {
          provide: IRolesRepository,
          useFactory: mockRepoFactory,
        },
        {
          provide: IPermissionsService,
          useFactory: mockServiceFactory,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    permissionsService = module.get(IPermissionsService);

    mockRepo = module.get(IRolesRepository);
  });

  // /** keep it to skip scenarios quicker

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create: throws error without user in context', async () => {
    const payload = { name: sampleRoleAdmin.name };

    await expect(() => service.create(payload, {})).rejects.toThrow(
      UsersMessage.MISSING_CONTEXT_USER,
    );

    expect(mockRepo.create).toHaveBeenCalledTimes(0);
  });

  it('create: throws error without tenant in context', async () => {
    const payload = { name: sampleRoleAdmin.name };

    await expect(() =>
      service.create(payload, { user: johnDoe }),
    ).rejects.toThrow(TenantsMessage.MISSING_CONTEXT_TENANT);

    expect(mockRepo.create).toHaveBeenCalledTimes(0);
  });

  it('create: throws error with empty name', async () => {
    const payload = { name: '' };

    await expect(() =>
      service.create(payload, { user: johnDoe, tenant: tenantWithMember }),
    ).rejects.toThrow(RolesMessage.EMPTY_ROLE_NAME);

    expect(mockRepo.create).toHaveBeenCalledTimes(0);
  });

  it('create: throws error when role.slug already exists', async () => {
    const payload = { name: sampleRoleAdmin.name };
    mockRepo.findOne.mockImplementationOnce(() => sampleRoleAdmin);

    await expect(() =>
      service.create(payload, { user: johnDoe, tenant: tenantWithMember }),
    ).rejects.toThrow(RolesMessage.ALREADY_EXISTS);

    expect(mockRepo.create).toHaveBeenCalledTimes(0);
  });

  it('create: requests repository and upserts permissions', async () => {
    const payload = { name: sampleRoleAdmin.name };
    mockRepo.findOne.mockImplementationOnce(() => null);
    mockRepo.create.mockImplementationOnce(() => sampleRoleAdmin);
    await service.create(payload, {
      user: johnDoe,
      tenant: tenantWithMember,
      entityManager,
    });
    expect(mockRepo.create).toHaveBeenCalledWith({
      ...payload,
      slug: sampleRoleAdmin.slug,
      tenantId,
    });

    expect(permissionsService.upsert).toHaveBeenCalledTimes(1);
    expect(permissionsService.upsert).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          target: { roles: { id: roleId } },
          action: AbilityAction.Read,
          description: expect.any(String),
          // key: expect.any(String),
          key: 'can_read_member_administrator',
          resource: 'Member',
          tenantId,
        }),
        expect.objectContaining({
          target: { roles: { id: roleId } },
          action: AbilityAction.Manage,
          description: expect.any(String),
          key: 'can_manage_member_administrator',
          resource: 'Member',
          tenantId,
        }),
      ],
      { user: johnDoe, tenant: tenantWithMember, entityManager },
    );
  });

  it('findMany: requests repository', async () => {
    const payload = { name: sampleRoleAdmin.name };
    await service.findMany(payload, {
      user: johnDoe,
      tenant: tenantWithMember,
    });
    expect(mockRepo.findMany).toHaveBeenCalledWith({
      where: { ...payload, tenantId },
    });
  });

  it('findOne: requests repository', async () => {
    const payload = { name: sampleRoleAdmin.name };
    await service.findOne(payload, {
      user: johnDoe,
      tenant: tenantWithMember,
    });
    expect(mockRepo.findOne).toHaveBeenCalledWith({
      where: { ...payload, tenantId },
    });
  });

  it('update: throws error without tenant in context', async () => {
    const payload = { permissions: [] };
    await expect(() =>
      service.update(roleId, payload, { user: johnDoe }),
    ).rejects.toThrow(TenantsMessage.MISSING_CONTEXT_TENANT);
    expect(mockRepo.save).toHaveBeenCalledTimes(0);
  });

  it('update: requests repository', async () => {
    const payload = { permissions: [] };
    mockRepo.find.mockImplementationOnce(() => [{ ...sampleRoleAdmin }]);
    await service.update(roleId, payload, {
      user: johnDoe,
      tenant: tenantWithMember,
      entityManager,
    });
    expect(mockRepo.save).toHaveBeenCalledWith(
      {
        ...sampleRoleAdmin,
        permissions: [],
      },
      { entityManager },
    );
  });

  it('remove: requests repository', async () => {
    await service.remove(roleId, { user: johnDoe, tenant: tenantWithMember });
    expect(mockRepo.remove).toHaveBeenCalledWith(
      {
        id: sampleRoleAdmin.id,
        tenantId,
      },
      { entityManager },
    );
  });

  /** keep it to skip scenarios quicker */
});
