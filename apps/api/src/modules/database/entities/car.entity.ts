import { Logger } from '@nestjs/common';
import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ClassEntity } from './class.entity';
import type { ScheduleEntity } from './schedule.entity';

export enum CarCategory {
	CLOSED_CIRCUIT = 'closed_circuit',
	ON_ROAD = 'on_road',
}

export enum CarType {
	MANUAL = 'manual',
	AUTOMATIC = 'automatic',
}

export enum CarStatus {
	LOCKED = 'locked',
	AVAILABLE = 'available',
}

@Entity({ name: 'cars' })
@Unique(['customId'])
export class CarEntity extends BaseEntity {
	@Exclude()
	@ApiHideProperty()
	logger = new Logger(CarEntity.name);

	@ApiProperty()
	@Column({
		type: 'enum',
		enum: CarType,
		default: CarType.MANUAL,
		nullable: false,
	})
	type!: CarType;

	@ApiProperty()
	@Column({
		type: 'enum',
		enum: CarCategory,
		default: CarCategory.CLOSED_CIRCUIT,
		nullable: false,
	})
	category!: CarCategory;

	@ApiPropertyOptional()
	@Column({ type: 'varchar', length: 255, nullable: true })
	customId?: string | null;

	@ApiPropertyOptional()
	@Column({ type: 'varchar', length: 255, nullable: true })
	reason?: string | null;

	@ApiPropertyOptional()
	@Column({ type: 'varchar', length: 255, nullable: true })
	place?: string | null;

	@ApiProperty()
	@Column({
		type: 'enum',
		enum: CarStatus,
		default: CarStatus.AVAILABLE,
		nullable: false,
	})
	status!: CarStatus;

	@ApiProperty()
	@ManyToOne(
		() => ClassEntity,
		(classEntity: ClassEntity) => classEntity.cars,
		{ nullable: false },
	)
	@JoinColumn({ name: 'class_id' })
	class!: ClassEntity;

	@ApiProperty()
	@OneToMany(
		() => require('./schedule.entity').ScheduleEntity,
		(schedule: ScheduleEntity) => schedule.car,
	)
	schedules!: ScheduleEntity[];
}
