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
import { UserEntity } from './user.entity';
// import { TenantEntity } from './tenant.entity';

import { RoleEntity } from './role.entity';
import { AbstractDto } from '@w7t/multi-tenant/infra/abstract/abstract.dto';
import { TenantEntity } from './tenant.entity';
import { sampleTenant01 } from '@w7t/multi-tenant/core/tenants/interfaces/tenants.samples';
import { sampleMember01 } from '@w7t/multi-tenant/core/members/interfaces/members.samples';

@Entity({ name: 'members' })
@Index(['tenantId', 'userId'], { unique: true })
export class MemberEntity extends AbstractDto<MemberEntity> {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: sampleMember01.id })
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: '' })
  @ApiProperty({ maxLength: 255, example: sampleMember01.name })
  name?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: '' })
  @ApiProperty({ maxLength: 255, example: sampleMember01.email })
  email?: string;

  @Column({ type: 'boolean', nullable: true, default: false })
  @ApiProperty({ default: false })
  isOwner: boolean;

  @Column({ type: 'varchar' })
  @ApiProperty({ example: sampleTenant01.id })
  tenantId: string;

  @Column({ type: 'varchar' })
  @ApiProperty({ example: sampleMember01.userId })
  userId: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @ManyToOne('UserEntity', (user: UserEntity) => user.members)
  @ApiProperty({ type: UserEntity })
  user?: UserEntity;

  @ManyToOne(() => TenantEntity, (tenant: TenantEntity) => tenant.members)
  tenant?: TenantEntity;

  @ManyToMany(() => RoleEntity, (role: RoleEntity) => role.members)
  @JoinTable({ name: 'members_roles' })
  roles?: RoleEntity[];
}
