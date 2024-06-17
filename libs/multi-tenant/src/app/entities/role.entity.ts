import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TenantEntity } from './tenant.entity';
import { PermissionEntity } from './permission.entity';
import { MemberEntity } from './member.entity';
import { AbstractDto } from '@w7t/multi-tenant/infra/abstract/abstract.dto';

@Entity({ name: 'roles' })
export class RoleEntity extends AbstractDto<RoleEntity> {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column()
  @ApiProperty()
  name: string;

  @Column({ default: '' })
  @ApiProperty()
  description: string;

  @Column({ default: '' })
  @ApiProperty()
  icon: string;

  @Column({
    default: false,
  })
  @ApiProperty()
  isDefault: boolean;

  @Column({
    type: 'uuid',
  })
  @ApiProperty()
  tenantId: string;

  @Column()
  @ApiProperty()
  slug: string;

  @ManyToMany(() => PermissionEntity, (permission) => permission.roles)
  @JoinTable({ name: 'roles_permissions' })
  permissions?: PermissionEntity[];

  @ManyToMany(() => MemberEntity, (member: MemberEntity) => member.roles)
  members?: MemberEntity[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  @ApiProperty()
  updatedAt: Date;

  @ManyToOne(() => TenantEntity, (tenant: TenantEntity) => tenant.roles)
  tenant?: TenantEntity;
}
