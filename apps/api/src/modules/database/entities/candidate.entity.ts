import { Logger } from '@nestjs/common';
import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import type { ScheduleEntity } from './schedule.entity';

@Entity({ name: 'candidates' })
@Unique(['phone'])
export class CandidateEntity extends BaseEntity {
	@Exclude()
	@ApiHideProperty()
	logger = new Logger(CandidateEntity.name);

	@ApiProperty()
	@Column({ type: 'varchar', length: 255, nullable: false })
	name!: string;

	@ApiProperty()
	@Column({ type: 'varchar', length: 255, nullable: false })
	phone!: string;

	@ApiPropertyOptional()
	@Column({ type: 'varchar', length: 255, nullable: true })
	email?: string | null;

	@ApiPropertyOptional()
	@Column({ type: 'varchar', length: 255, nullable: true })
	address?: string | null;

	@ApiProperty()
	@OneToMany(
		() => require('./schedule.entity').ScheduleEntity,
		(schedule: ScheduleEntity) => schedule.candidate,
	)
	schedules!: ScheduleEntity[];
}
