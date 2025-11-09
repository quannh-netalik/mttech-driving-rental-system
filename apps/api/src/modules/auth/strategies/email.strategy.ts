import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '@/modules/auth';
import { UserEntity } from '@/modules/database/entities';

@Injectable()
export class EmailStrategy extends PassportStrategy(Strategy, 'email') {
	constructor(private readonly authService: AuthService) {
		super({ usernameField: 'email', session: true });
	}

	async validate(email: string, password: string): Promise<UserEntity> {
		return this.authService.validateUserForLogin(email, password);
	}
}
