import { Column, Entity, Index, Unique } from 'typeorm';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from './base.entity';
import { Exclude, Expose } from 'class-transformer';

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  EXECUTIVE = 'executive',
}

@Entity({ name: 'users' })
@Unique(['email'])
export class UserEntity extends BaseEntity {
  @Index()
  @ApiProperty()
  @Column({ type: 'varchar', length: 255, nullable: false })
  email!: string;

  @ApiHideProperty()
  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: false })
  password!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255, nullable: false })
  firstName!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255, nullable: false })
  lastName!: string;

  @ApiProperty({ enum: UserRole, default: UserRole.EXECUTIVE })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EXECUTIVE,
    nullable: false,
  })
  role!: UserRole;

  @ApiProperty()
  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
