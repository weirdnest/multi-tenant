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

@Entity({ name: 'permissions' })
export class PermissionEntity {
  @ManyToOne(() => TenantEntity, (tenant: TenantEntity) => tenant.permissions)
  tenant: TenantEntity;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  @Index()
  tenantId?: string;

  @Column()
  key: string;

  @Column({ unique: true })
  @Index()
  keyTenant: string;

  @Column({ default: '' })
  name?: string;

  @Column({ default: '' })
  description?: string;

  @Column({ default: '', nullable: true })
  action?: string;

  @Column({ type: 'jsonb', default: null, nullable: true })
  target?: object;

  @Column({ default: '', nullable: true })
  resource?: string;

  // @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
  // rolePermissions: RolePermission[];

  @Column({ nullable: true })
  @Index()
  roleId?: string;

  @ManyToMany(() => RoleEntity, (role: RoleEntity) => role.permissions)
  roles: RoleEntity[];

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
