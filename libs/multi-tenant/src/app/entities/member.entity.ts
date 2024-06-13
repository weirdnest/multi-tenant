import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { UserEntity } from './user.entity';
// import { TenantEntity } from './tenant.entity';

import { RoleEntity } from './role.entity';
import { AbstractDto } from '@w7t/multi-tenant/infra/abstract/abstract.dto';
import { TenantEntity } from './tenant.entity';

@Entity({ name: 'members' })
@Index(['tenantId', 'userId'], { unique: true })
export class MemberEntity extends AbstractDto<MemberEntity> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: '' })
  name?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: '' })
  email?: string;

  @Column({ type: 'boolean', nullable: true, default: false })
  isOwner: boolean;

  @Column({ type: 'varchar' })
  tenantId: string;

  @Column({ type: 'varchar' })
  userId: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  @ApiProperty()
  updatedAt: Date;

  @ManyToOne('UserEntity', (user: UserEntity) => user.members)
  user: UserEntity;

  @ManyToOne(() => TenantEntity, (tenant: TenantEntity) => tenant.members)
  tenant: TenantEntity;

  @ManyToMany(() => RoleEntity, (role: RoleEntity) => role.members)
  @JoinTable({ name: 'members_roles' })
  roles: RoleEntity[];
}
