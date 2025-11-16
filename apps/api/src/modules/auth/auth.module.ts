import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import Redis from 'ioredis';

import { UserRepository } from '@/modules/database/repositories';
import { createRedisOptions } from '@/modules/redis';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailAuthGuard, JwtAuthGuard } from './guards';
import { EmailStrategy, JwtStrategy } from './strategies';

@Module({
	imports: [
		ThrottlerModule.forRoot({
			throttlers: [{ limit: 5, ttl: seconds(60) }],
			skipIf: context => context.switchToHttp().getRequest().path !== '/auth/sign-in',
			storage: new ThrottlerStorageRedisService(new Redis(createRedisOptions('mttech-throttle:'))),
		}),
		PassportModule.register({
			defaultStrategy: 'jwt',
			session: false,
		}),
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				global: true,
				secret: config.getOrThrow<string>('JWT_SECRET'),
			}),
		}),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		UserRepository,
		{
			provide: JwtStrategy,
			useFactory: (configService: ConfigService, authService: AuthService) => {
				return new JwtStrategy(configService, authService);
			},
			inject: [ConfigService, AuthService],
		},
		{
			provide: EmailStrategy,
			useFactory: (authService: AuthService) => {
				return new EmailStrategy(authService);
			},
			inject: [AuthService],
		},
		EmailAuthGuard,
		JwtAuthGuard,
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
})
export class AuthModule {}
