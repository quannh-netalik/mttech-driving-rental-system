import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guard';
import { UserEntity } from '@/modules/database/entities/user.entity';
import { UserService } from './user.service';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('/profile')
	@ApiOperation({ summary: 'Get user profile' })
	async profile(@Req() req: FastifyRequest): Promise<UserEntity> {
		// biome-ignore lint/style/noNonNullAssertion: guarded
		return req.user!;
	}
}
