import { Logger } from '@nestjs/common';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { CandidateEntity } from './candidate.entity';
import { CarEntity } from './car.entity';
import type { InvoiceEntity } from './invoice.entity';
import { UserEntity } from './user.entity';

export enum ScheduleStatus {
	AVAILABLE = 'available',
	IN_PROGRESS = 'in_progress',
	COMPLETED = 'completed',
	CANCELLED = 'cancelled',
}

@Entity({ name: 'schedules' })
export class ScheduleEntity extends BaseEntity {
	@Exclude()
	@ApiHideProperty()
	logger = new Logger(ScheduleEntity.name);

	@ApiProperty()
	@Column({ type: 'timestamp', nullable: false })
	from!: Date;

	@ApiProperty()
	@Column({ type: 'timestamp', nullable: false })
	to!: Date;

	@ApiProperty()
	@Column({ type: 'decimal', precision: 15, scale: 2, nullable: false })
	overtimePrice!: number;

	@ApiProperty()
	@Column({ type: 'enum', enum: ScheduleStatus, nullable: false })
	status!: ScheduleStatus;

	@ApiProperty()
	@ManyToOne(
		() => CandidateEntity,
		(candidate: CandidateEntity) => candidate.schedules,
		{ nullable: false },
	)
	@JoinColumn({ name: 'candidate_id' })
	candidate!: CandidateEntity;

	@ApiProperty()
	@ManyToOne(
		() => CarEntity,
		(car: CarEntity) => car.schedules,
		{ nullable: false },
	)
	@JoinColumn({ name: 'car_id' })
	car!: CarEntity;

	@ApiProperty()
	@ManyToOne(
		() => UserEntity,
		(user: UserEntity) => user.schedules,
		{ nullable: false },
	)
	@JoinColumn({ name: 'created_by' })
	createdBy!: UserEntity;

	@ApiProperty()
	@OneToMany(
		() => require('./invoice.entity').InvoiceEntity,
		(invoice: InvoiceEntity) => invoice.schedule,
	)
	invoices!: InvoiceEntity[];
}
