import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '@/modules/auth/auth.service';
import { UserEntity } from '@/modules/database/entities';

import { PayloadDto } from '../dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		protected readonly configService: ConfigService,
		private readonly authService: AuthService,
	) {
		super({
			ignoreExpiration: false,
			secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		});
	}

	async validate(payload: PayloadDto): Promise<UserEntity> {
		return this.authService.verify(payload);
	}
}
