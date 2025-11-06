import { BeforeInsert, BeforeUpdate, Column, Entity, Index, Unique } from 'typeorm';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import argon2 from 'argon2';

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

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    // Only hash the password if it has been modified
    if (this.password) {
      try {
        this.password = await argon2.hash(this.password, {
          type: argon2.argon2id,
          memoryCost: 2 ** 16, // 64MB
          timeCost: 3, // Number of iterations
          parallelism: 1, // Number of threads used
        });
      } catch (error) {
        throw new Error('Error hashing password');
      }
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    try {
      return await argon2.verify(this.password, password);
    } catch (error) {
      throw new Error('Error validating password');
    }
  }

  @ApiHideProperty()
  @Exclude()
  @Column({ type: 'varchar', length: 1024, nullable: true })
  refreshToken?: string;

  async setRefreshToken(refreshToken: string): Promise<void> {
    try {
      this.refreshToken = await argon2.hash(refreshToken);
    } catch (error) {
      throw new Error('Error hashing refresh token');
    }
  }

  async validateRefreshToken(refreshToken: string): Promise<boolean> {
    try {
      return this.refreshToken ? await argon2.verify(this.refreshToken, refreshToken) : false;
    } catch (error) {
      throw new Error('Error validating refresh token');
    }
  }
}
