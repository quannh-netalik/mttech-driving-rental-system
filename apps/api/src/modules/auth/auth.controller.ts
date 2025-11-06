import type { Request as ExpressRequest } from 'express';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserEntity } from '@/modules/database/entities';

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
    schema: {
      example: {
        statusCode: 409,
        message: 'Email already exists',
        error: 'Conflict',
      },
    },
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
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      },
    },
  })
  async signIn(@Req() req: ExpressRequest): Promise<AuthTokensDto> {
    return this.authService.signIn(<UserEntity>req.user);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token successfully refreshed', type: AuthTokensDto })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid refresh token',
        error: 'Unauthorized',
      },
    },
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthTokensDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }
}
