import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensDto {
	@ApiProperty({
		description: 'Token Nonce',
		example: 'Z2BaLWR8_Z5jdAp0B-qoC',
	})
	readonly nonce!: string;

	@ApiProperty({
		description: 'JWT access token',
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
	})
	readonly accessToken!: string;

	@ApiProperty({
		description: 'JWT refresh token',
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
	})
	readonly refreshToken!: string;
}
