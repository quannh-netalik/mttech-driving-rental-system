import { Logger } from '@nestjs/common';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { decimalTransformer } from '../helpers';
import { BaseEntity } from './base.entity';
import type { CarEntity } from './car.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'classes' })
export class ClassEntity extends BaseEntity {
	@Exclude()
	@ApiHideProperty()
	logger = new Logger(ClassEntity.name);

	@ApiProperty()
	@Column({ type: 'varchar', length: 255, nullable: false })
	title!: string;

	@ApiProperty()
	@Column({
		type: 'decimal',
		precision: 15,
		scale: 2,
		nullable: false,
		transformer: decimalTransformer,
	})
	price!: number;

	@ApiProperty()
	@ManyToOne(
		() => UserEntity,
		(user: UserEntity) => user.classes,
		{ nullable: false },
	)
	@JoinColumn({ name: 'created_by' })
	createdBy!: UserEntity;

	@ApiProperty()
	@OneToMany(
		() => require('./car.entity').CarEntity,
		(car: CarEntity) => car.class,
	)
	cars!: CarEntity[];
}
