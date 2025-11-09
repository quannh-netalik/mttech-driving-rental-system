import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { UserEntity } from '@/modules/database/entities';
import { ErrorResponseDto } from '../../types/error.type';
import { AuthService } from './auth.service';
import { AuthTokensDto, RefreshTokenDto, SignInDto, SignUpDto } from './dto';
import { EmailAuthGuard } from './guards';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('sign-up')
	@ApiOperation({ summary: 'Sign up a new user' })
	@ApiResponse({ status: 201, description: 'User successfully created', type: AuthTokensDto })
	@ApiResponse({
		status: 409,
		description: 'Email already exists',
		type: ErrorResponseDto,
	})
	async signUp(@Body() signUpDto: SignUpDto): Promise<AuthTokensDto> {
		return this.authService.signUp(signUpDto);
	}

	@Post('sign-in')
	@UseGuards(EmailAuthGuard)
	@ApiOperation({ summary: 'Sign in user' })
	@ApiBody({ type: SignInDto })
	@ApiResponse({ status: 200, description: 'User successfully authenticated', type: AuthTokensDto })
	@ApiResponse({
		status: 401,
		description: 'Invalid credentials',
		type: ErrorResponseDto,
		schema: {
			example: {
				path: '/api/auth/sign-in',
				method: 'POST',
				status: 401,
				exceptionType: 'HttpException',
				timestamp: '2025-11-08T22:43:17.972Z',
				message: 'Invalid credentials',
				stack: 'UnauthorizedException: Invalid credentials',
			},
		},
	})
	@ApiResponse({
		status: 429,
		description: 'Too Many Requests',
		type: ErrorResponseDto,
	})
	async signIn(@Req() req: Request): Promise<AuthTokensDto> {
		return this.authService.signIn(<UserEntity>req.user);
	}

	@Post('renew-refresh-token')
	@ApiOperation({ summary: 'Refresh access token' })
	@ApiResponse({ status: 200, description: 'Token successfully refreshed', type: AuthTokensDto })
	@ApiResponse({
		status: 401,
		description: 'Invalid refresh token',
		type: ErrorResponseDto,
	})
	async renewRefreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthTokensDto> {
		return this.authService.renewRefreshToken(refreshTokenDto);
	}
}
