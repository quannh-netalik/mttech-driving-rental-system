import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IsOptional } from 'class-validator';

/**
 * Base entity class that provides common fields and validation for all entities
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  public readonly id!: number;

  @CreateDateColumn({ type: 'timestamp' })
  public readonly createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public readonly updatedAt!: Date;

  @DeleteDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  @IsOptional()
  public readonly deletedAt?: Date;
}
