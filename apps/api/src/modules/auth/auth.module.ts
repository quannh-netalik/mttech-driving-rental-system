import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { Request as ExpressRequest } from 'express';

import { createRedisOptions } from '@/modules/redis';
import { UserRepository } from '@/modules/database/repositories';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailStrategy, JwtStrategy } from './strategies';
import { EmailAuthGuard, JwtAuthGuard } from './guards';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ limit: 5, ttl: seconds(60) }],
      skipIf: context => context.switchToHttp().getRequest<ExpressRequest>().path !== '/auth/sign-in',
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
        signOptions: { expiresIn: +config.getOrThrow<number>('JWT_AC_TTL') },
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
