import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guard';
import { UserEntity } from '@/modules/database/entities/user.entity';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('/profile')
	async profile(@Req() req: FastifyRequest): Promise<UserEntity> {
		// biome-ignore lint/style/noNonNullAssertion: guarded
		return req.user!;
	}
}
