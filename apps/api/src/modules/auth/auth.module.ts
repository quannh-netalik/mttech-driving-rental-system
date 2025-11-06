import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { UserRepository } from '@/modules/database/repositories';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailStrategy, JwtStrategy } from './strategies';
import { EmailAuthGuard, JwtAuthGuard } from './guards';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: true,
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
  ],
})
export class AuthModule {}
