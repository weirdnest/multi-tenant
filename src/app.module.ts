import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MultiTenantModule } from '@w7t/multi-tenant';
import { UserEntity } from '@w7t/multi-tenant/app/entities/user.entity';
import * as Joi from 'joi';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEntity } from '@w7t/multi-tenant/app/entities/member.entity';
import { TenantEntity } from '@w7t/multi-tenant/app/entities/tenant.entity';
import { RoleEntity } from '@w7t/multi-tenant/app/entities/role.entity';
import { PermissionEntity } from '@w7t/multi-tenant/app/entities/permission.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().required(),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        POSTGRES_DB_TEST: Joi.string().optional(),
      }),
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const env = configService.get('NODE_ENV');
        const isDevEnv = env === 'develop';
        const isTestEnv = env === 'test';
        const synchronize = isDevEnv || isTestEnv ? true : false;
        const database = isTestEnv
          ? configService.get('POSTGRES_DB_TEST') ||
            `${configService.get('POSTGRES_DB')}-test`
          : configService.get('POSTGRES_DB');

        // console.log(`app.module: db init:`, { env, synchronize });
        return {
          type: 'postgres',
          host: configService.get('POSTGRES_HOST'),
          port: configService.get('POSTGRES_PORT'),
          username: configService.get('POSTGRES_USER'),
          password: configService.get('POSTGRES_PASSWORD'),
          database,
          namingStrategy: new SnakeNamingStrategy(),
          // autoLoadEntities: true,
          entities: [
            UserEntity,
            MemberEntity,
            TenantEntity,
            RoleEntity,
            PermissionEntity,
          ],
          synchronize,
        };
      },
    }),

    MultiTenantModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
