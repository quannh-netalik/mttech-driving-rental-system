import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { UserEntity } from '@/modules/database/entities';
import { BaseRepository } from './base.repository';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
	constructor(protected readonly entityManager: EntityManager) {
		super(UserEntity, entityManager);
	}
}
