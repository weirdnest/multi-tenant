import { Module } from '@nestjs/common';
import { AbilitiesModule } from './core/abilities/abilities.module';
import { UsersController } from './app/controllers/users.controller';
import {
  AuthJwtRefreshStrategy,
  AuthJwtStrategy,
  AuthLocalStrategy,
  AuthTenantStrategy,
} from './app/auth';
import { AuthController } from './app/controllers/auth.controller';
import {
  AuthServiceProvider,
  ConfigServiceProvider,
  MembersRepositoryProvider,
  MembersServiceProvider,
  PermissionsRepositoryProvider,
  PermissionsServiceProvider,
  RolesRepositoryProvider,
  RolesServiceProvider,
  TenantsRepositoryProvider,
  TenantsServiceProvider,
  UsersRepositoryProvider,
  UsersServiceProvider,
} from './infra';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './app/entities/user.entity';
import { MemberEntity } from './app/entities/member.entity';
import { JwtServiceProvider } from './infra/providers/jwt-service.provider';
import { TenantEntity } from './app/entities/tenant.entity';
import { TenantsController } from './app/controllers/tenants.controller';
import { AuthTenantController } from './app/controllers/auth-tenant.controller';
import { MembersController } from './app/controllers/members.controller';
import { RoleEntity } from './app/entities/role.entity';
import { PermissionEntity } from './app/entities/permission.entity';
import { PermissionsController } from './app/controllers/permissions.controller';
import { RolesController } from './app/controllers/roles.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      MemberEntity,
      TenantEntity,
      RoleEntity,
      PermissionEntity,
    ]),
    AbilitiesModule,
    // UsersModule,
    // AuthModule,
  ],
  providers: [
    JwtServiceProvider,
    ConfigServiceProvider,

    UsersServiceProvider,
    UsersRepositoryProvider,

    MembersRepositoryProvider,
    MembersServiceProvider,

    TenantsRepositoryProvider,
    TenantsServiceProvider,

    RolesRepositoryProvider,
    RolesServiceProvider,

    PermissionsRepositoryProvider,
    PermissionsServiceProvider,

    AuthServiceProvider,
    AuthJwtStrategy,
    AuthLocalStrategy,
    AuthJwtRefreshStrategy,

    AuthTenantStrategy,
  ],
  controllers: [
    UsersController,
    AuthController,
    TenantsController,
    AuthTenantController,
    MembersController,
    PermissionsController,
    RolesController,
  ],
  exports: [],
})
export class MultiTenantModule { }
