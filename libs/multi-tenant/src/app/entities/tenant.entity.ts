import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MemberEntity } from './member.entity';
import { RoleEntity } from './role.entity';
import { PermissionEntity } from './permission.entity';

@Entity({ name: 'tenants' })
export class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ maxLength: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @ApiProperty({ maxLength: 255 })
  slug: string;

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

  @OneToMany(() => MemberEntity, (member: MemberEntity) => member.tenant)
  members: MemberEntity[];

  @OneToMany(() => RoleEntity, (role: RoleEntity) => role.tenant)
  roles: RoleEntity[];

  @OneToMany(
    () => PermissionEntity,
    (permission: PermissionEntity) => permission.tenant,
  )
  permissions: PermissionEntity[];
}
