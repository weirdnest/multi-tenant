import { TestingModule, Test } from '@nestjs/testing';
import { AbilitiesService } from '../abilities.service';
import { AbilityFactoryProvider } from '@w7t/multi-tenant/infra/providers/ability-factory.provider';
import { AbilitiesServiceProvider } from '@w7t/multi-tenant/infra/providers/abilities-service.provider';
import { IAbilitiesService, SetAbilitiesContext, SetAbilitiesOptions } from '../interfaces';
import { CaslAbilitySubjects } from '@w7t/multi-tenant/infra';
import { AbilityAction, AbilityMessages } from '../constants';
import { Member } from '../../members/entities/member';
import { johnDoe } from '../../users/interfaces/users.samples';
import { sampleTenant01 } from '../../tenants/interfaces/tenants.samples';
import { sampleMember01 } from '../../members/interfaces/members.samples';
import { sampleRoleAdmin, sampleRoleMember } from '../../roles/interfaces/roles.samples';
import { samplePermissionCanManageMember, samplePermissionCanReadAdmin, samplePermissionCanReadMember } from '../../permissions/interfaces/permissions.samples';

describe('AbilitiesService', () => {
  let service: IAbilitiesService;


  const tenantWhereCanReadMembers = {
    ...sampleTenant01, members: [{
      ...sampleMember01,
      isOwner: false,
      roles: [{
        ...sampleRoleMember,
        permissions: [
          samplePermissionCanReadMember,
        ]
      }],
    }],
  };

  const tenantWhereCanManageMembers = {
    ...sampleTenant01, members: [{
      ...sampleMember01,
      isOwner: false,
      roles: [{
        ...sampleRoleMember,
        permissions: [
          samplePermissionCanManageMember,
        ]
      }],
    }],
  };


  const setAbilities = async (
    context: SetAbilitiesContext,
    { can, cannot }: SetAbilitiesOptions<CaslAbilitySubjects>,
  ) => {
    const { user, tenant } = context || {};
    const { id: userId } = user || {};
    const { id: tenantId, members } = tenant || {};
    const [member] = members || [];
    const isMember = member?.id;
    const isOwner = member?.isOwner;

    const permissions = service.getRelatedPermissions(
      member,
      'Member',
    );
    console.log(`test: setAbilities: isOwner: ${isOwner}, permissions:`, permissions);
    if (isOwner) {
      can(AbilityAction.Manage, Member, { tenantId });
    } else if (isMember) {
      permissions.forEach((permission) => {
        console.log(`test: setAbilities: permission.target:`, permission.target);
        can(permission.action as AbilityAction, Member, { ...permission.target });
      })
    } else {
      // not a member
    }
  }


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // LoggerProvider,
        AbilityFactoryProvider,
        AbilitiesServiceProvider,
      ],
    }).compile();

    service = await module.resolve(IAbilitiesService);
    service.configure(setAbilities);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // /** keep it to skip scenarios quicker

  it('canManageMember: should allow to create', async () => {
    await service.allow(AbilityAction.Create, Member, {
      user: johnDoe, tenant: tenantWhereCanManageMembers
    }, {
      tenantId: sampleTenant01.id,
      roleId: sampleRoleMember.id,
    });
  });


  it('canManageMember: should allow to read', async () => {
    await service.allow(AbilityAction.Read, Member, {
      user: johnDoe, tenant: tenantWhereCanManageMembers
    }, {
      tenantId: sampleTenant01.id,
      roleId: sampleRoleMember.id,
    });
  });

  it('canManageMember: should allow to update', async () => {
    await service.allow(AbilityAction.Update, Member, {
      user: johnDoe, tenant: tenantWhereCanManageMembers
    }, {
      tenantId: sampleTenant01.id,
      roleId: sampleRoleMember.id,
    });
  });

  it('canManageMember: should allow to remove', async () => {
    await service.allow(AbilityAction.Delete, Member, {
      user: johnDoe, tenant: tenantWhereCanManageMembers
    }, {
      tenantId: sampleTenant01.id,
      roleId: sampleRoleMember.id,
    });
  });

  it('canReadMember: should not allow to create', async () => {
    await expect(async () => {
      await service.allow(AbilityAction.Create, Member, {
        user: johnDoe, tenant: tenantWhereCanReadMembers
      }, {
        tenantId: sampleTenant01.id,
        roleId: sampleRoleMember.id,
      });
    }).rejects.toThrow(AbilityMessages.FORBIDDEN);
  });

  it('canReadMember: should not allow to update', async () => {
    await expect(async () => {
      await service.allow(AbilityAction.Update, Member, {
        user: johnDoe, tenant: tenantWhereCanReadMembers
      }, {
        tenantId: sampleTenant01.id,
        roleId: sampleRoleMember.id,
      });
    }).rejects.toThrow(AbilityMessages.FORBIDDEN);
  });

  it('canReadMember: should not allow to remove', async () => {
    await expect(async () => {
      await service.allow(AbilityAction.Delete, Member, {
        user: johnDoe, tenant: tenantWhereCanReadMembers
      }, {
        tenantId: sampleTenant01.id,
        roleId: sampleRoleMember.id,
      });
    }).rejects.toThrow(AbilityMessages.FORBIDDEN);
  });


  it('canReadMember: should allow to read', async () => {
    await service.allow(AbilityAction.Read, Member, {
      user: johnDoe, tenant: tenantWhereCanReadMembers
    }, {
      tenantId: sampleTenant01.id,
      roleId: sampleRoleMember.id,
    });
  });


  /** keep it to skip scenarios quicker */
});