import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { TenantEntity } from './tenant.entity';
import { RoleEntity } from './role.entity';
import { AbstractDto } from '@w7t/multi-tenant/infra';
import { ApiProperty } from '@nestjs/swagger';
import { samplePermissionCanReadAdmin } from '@w7t/multi-tenant/core/permissions/interfaces/permissions.samples';
import { AbilityAction } from '@w7t/multi-tenant/core/abilities';
import { Exclude } from 'class-transformer';

@Entity({ name: 'permissions' })
export class PermissionEntity extends AbstractDto<PermissionEntity> {
  @ManyToOne(() => TenantEntity, (tenant: TenantEntity) => tenant.permissions)
  tenant?: TenantEntity;

  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ nullable: true })
  @Index()
  @ApiProperty()
  tenantId?: string;

  @Column()
  @ApiProperty({ description: `Unique permission key (within tenant data)`, example: samplePermissionCanReadAdmin.key })
  key: string;

  @Column({ unique: true })
  @Index()
  keyTenant: string;

  @Column({ default: '' })
  @ApiProperty({ description: `Permission name`, example: samplePermissionCanReadAdmin.name })
  name?: string;

  @Column({ default: '' })
  @ApiProperty({ description: `Permission description`, example: samplePermissionCanReadAdmin.description })
  description?: string;

  @Column({ default: '', nullable: true })
  @ApiProperty({ description: `Permitted action`, type: 'enum', enum: AbilityAction, example: samplePermissionCanReadAdmin.action })
  action?: string;

  @Column({ type: 'jsonb', default: null, nullable: true })
  @ApiProperty({ description: `Filter conditions`, example: samplePermissionCanReadAdmin.target })
  target?: object;

  @Column({ default: '', nullable: true })
  @ApiProperty({ description: `Resource entity name`, example: samplePermissionCanReadAdmin.resource })
  resource?: string;

  @ManyToMany(() => RoleEntity, (role: RoleEntity) => role.permissions)
  roles?: RoleEntity[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
}
