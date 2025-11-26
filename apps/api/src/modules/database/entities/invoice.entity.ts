import { Logger } from '@nestjs/common';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { decimalTransformer } from '../helpers';
import { BaseEntity } from './base.entity';
import { ScheduleEntity } from './schedule.entity';

export enum InvoiceSource {
	BANK = 'bank',
	CASH = 'cash',
}

@Entity({ name: 'invoices' })
export class InvoiceEntity extends BaseEntity {
	@Exclude()
	@ApiHideProperty()
	logger = new Logger(InvoiceEntity.name);

	@ApiProperty()
	@Column({
		type: 'decimal',
		precision: 15,
		scale: 2,
		nullable: false,
		transformer: decimalTransformer,
	})
	amount!: number;

	@ApiProperty()
	@Column({ type: 'varchar', length: 255, nullable: false })
	description!: string;

	@ApiProperty()
	@Column({ type: 'enum', enum: InvoiceSource, nullable: false })
	source!: InvoiceSource;

	@ApiProperty()
	@ManyToOne(
		() => ScheduleEntity,
		(schedule: ScheduleEntity) => schedule.invoices,
		{ nullable: false },
	)
	@JoinColumn({ name: 'schedule_id' })
	schedule!: ScheduleEntity;
}
