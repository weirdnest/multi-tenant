import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
// import { UsersController } from './users.controller';
import { AbilitiesServiceProvider, UsersRepositoryProvider, UsersServiceProvider } from '@w7t/multi-tenant/infra/providers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@w7t/multi-tenant/app/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [
    UsersService,
    AbilitiesServiceProvider,
    UsersRepositoryProvider,
    UsersServiceProvider,
  ],
  exports: [
    UsersServiceProvider,
  ]
})
export class UsersModule { }
