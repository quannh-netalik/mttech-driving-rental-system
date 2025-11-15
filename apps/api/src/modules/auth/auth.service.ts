import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { instanceToPlain } from 'class-transformer';
import { nanoid } from 'nanoid';
import { UserEntity } from '@/modules/database/entities';
import { UserRepository } from '@/modules/database/repositories';
import { RedisService } from '@/modules/redis';
import { AuthTokensDto, PayloadDto, RefreshTokenDto, SignUpDto } from './dto';

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	private readonly jwtSecret: string;
	private readonly jwtAcTTL: number;
	private readonly jwtRfTTL: number;

	constructor(
		private readonly configService: ConfigService,
		private readonly userRepository: UserRepository,
		private readonly jwtService: JwtService,
		private readonly redisService: RedisService,
	) {
		this.jwtSecret = this.configService.getOrThrow<string>('JWT_SECRET');
		this.jwtAcTTL = 2;
		this.jwtRfTTL = +this.configService.getOrThrow<number>('JWT_RF_TTL');
	}

	async verify({ id }: PayloadDto): Promise<UserEntity> {
		const user = await this.userRepository.findOneBy({ id });
		if (!user) {
			throw new UnauthorizedException('Invalid or expired token');
		}
		this.logger.log(`user:${user.id} has verified successful`);

		return user;
	}

	async validateUserForLogin(email: string, password: string): Promise<UserEntity> {
		const user = await this.userRepository.findOne({
			where: { email },
		});

		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const isPasswordMatch = await user.validatePassword(password);
		if (isPasswordMatch) {
			this.logger.log(`user:${user.id} logged in successful`);
			return user;
		}

		throw new UnauthorizedException('Invalid credentials');
	}

	async signUp(signUpDto: SignUpDto): Promise<AuthTokensDto> {
		const existingUser = await this.userRepository.findOneBy({
			email: signUpDto.email,
		});
		if (existingUser) {
			throw new ConflictException('Email already exists');
		}

		const user = this.userRepository.create(signUpDto);
		const savedUser = await this.userRepository.save(user);
		this.logger.log(`${user.id} has registered successfully`);
		return this.generateTokens(savedUser);
	}

	async signIn(user: UserEntity): Promise<AuthTokensDto> {
		return this.generateTokens(user);
	}

	async refresh({ refreshToken }: RefreshTokenDto): Promise<AuthTokensDto> {
		try {
			const decoded = this.jwtService.verify<PayloadDto>(refreshToken, {
				secret: this.jwtSecret,
			});

			// Get the cached refresh token using the nonce from the JWT
			const tokenNonce = decoded.nonce;
			if (!tokenNonce) {
				throw new UnauthorizedException('Invalid refresh token format');
			}

			const [user, cachedRf] = await Promise.all([
				this.userRepository.findOneBy({ id: decoded.id }),
				this.redisService.get(`user:${decoded.id}:rf:${tokenNonce}`),
			]);

			if (!user || !cachedRf) {
				this.logger.error('[refresh] - validation error');
				throw new UnauthorizedException('Invalid or expired token');
			}

			const isRefreshTokenValid = await user.validateRefreshToken(refreshToken, cachedRf);
			if (!isRefreshTokenValid) {
				this.logger.error('[refresh] - Invalid refreshToken');
				throw new UnauthorizedException('Invalid refresh token');
			}

			// Delete THIS specific token immediately after validation
			await this.redisService.del(`user:${user.id}:rf:${tokenNonce}`);

			// Generate new tokens with a NEW nonce
			return await this.generateTokens(user);
		} catch (error) {
			if (error instanceof Error) {
				this.logger.error(`Token refresh failed: ${error.message}`, error.stack);
			}

			if (error instanceof UnauthorizedException) {
				throw error;
			}

			throw new UnauthorizedException('Invalid or expired refresh token');
		}
	}

	private async generateTokens(user: UserEntity): Promise<AuthTokensDto> {
		this.logger.log('starting generating new tokens');

		const tokenNonce = nanoid();

		const payload = new PayloadDto({ ...user, nonce: tokenNonce });
		const _payload = instanceToPlain(payload) as PayloadDto;

		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync<PayloadDto>(_payload, {
				secret: this.jwtSecret,
				expiresIn: this.jwtAcTTL,
			}),
			this.jwtService.signAsync<PayloadDto>(_payload, {
				secret: this.jwtSecret,
				expiresIn: this.jwtRfTTL,
			}),
		]);

		const hashedRf = await user.getHashedRefreshToken(refreshToken);
		await this.redisService.set(`user:${user.id}:rf:${tokenNonce}`, hashedRf, this.jwtRfTTL * 60 * 1000);

		this.logger.log('generated tokens successfully');

		return {
			nonce: tokenNonce,
			accessToken,
			refreshToken,
		};
	}
}
