import { Column, Entity, Index, Unique } from 'typeorm';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';
import { BaseEntity } from './base.entity';

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  EXECUTIVE = 'executive',
}

@Entity({ name: 'users' })
@Unique(['email'])
export class UserEntity extends BaseEntity {
  @Index()
  @IsEmail()
  @Column({ type: 'varchar', length: 255, nullable: false })
  email!: string;

  @ApiHideProperty()
  @Column({ type: 'varchar', length: 255, nullable: false })
  password!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  firstName!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  lastName!: string;

  @ApiProperty({ enum: UserRole, default: UserRole.EXECUTIVE })
  @IsEnum(UserRole)
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EXECUTIVE,
    nullable: false,
  })
  role!: UserRole;
}
