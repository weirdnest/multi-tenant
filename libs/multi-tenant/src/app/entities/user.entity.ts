import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AbstractDto } from '../../infra';
import { MemberEntity } from './member.entity';
import { johnDoe } from '@w7t/multi-tenant/core/users/interfaces/users.samples';

@Entity({ name: 'users' })
export class UserEntity extends AbstractDto<UserEntity> {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: johnDoe.id })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ example: johnDoe.name })
  name?: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @ApiProperty({ example: johnDoe.email })
  email?: string;

  @Column({
    nullable: true,
    default: null,
  })
  @Exclude()
  password: string;

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

  @OneToMany('MemberEntity', (member: MemberEntity) => member.user)
  members?: MemberEntity[];
}
