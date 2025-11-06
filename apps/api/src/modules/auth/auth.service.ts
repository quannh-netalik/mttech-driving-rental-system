import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { instanceToPlain } from 'class-transformer';

import { UserRepository } from '@/modules/database/repositories';
import { UserEntity } from '@/modules/database/entities';
import { RedisService } from '@/modules/redis';

import { AuthTokensDto, PayloadDto, RefreshTokenDto, SignInDto, SignUpDto } from './dto';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  private jwtSecret: string;
  private jwtAcTTL: number;
  private jwtRfTTL: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {
    this.jwtSecret = this.configService.getOrThrow<string>('JWT_SECRET');
    this.jwtAcTTL = this.configService.getOrThrow<number>('JWT_AC_TTL');
    this.jwtRfTTL = this.configService.getOrThrow<number>('JWT_RF_TTL');
  }

  async verify({ id }: PayloadDto): Promise<PayloadDto> {
    const user = await this.userRepository.findOneByOrFail({ id });
    if (!user) {
      throw new UnauthorizedException('User not existed');
    }

    const _user = instanceToPlain(user);
    return <PayloadDto>_user;
  }

  async validateUserForLogin(email: string, password: string): Promise<PayloadDto> {
    const user = await this.userRepository.findOneByOrFail({ email });
    const isPasswordMatch = await user.validatePassword(password);
    if (isPasswordMatch) {
      const _user = instanceToPlain(user);
      return <PayloadDto>_user;
    }

    throw new UnauthorizedException('User not existed');
  }
  async signUp(signUpDto: SignUpDto): Promise<AuthTokensDto> {
    const existingUser = await this.userRepository.findOneBy({ email: signUpDto.email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = this.userRepository.create(signUpDto);
    const savedUser = await this.userRepository.save(user);
    return this.generateTokens(savedUser);
  }

  async signIn(signInDto: SignInDto): Promise<AuthTokensDto> {
    const user = await this.userRepository.findOne({
      where: { email: signInDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.validatePassword(signInDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthTokensDto> {
    try {
      const decoded = this.jwtService.verify<PayloadDto>(refreshTokenDto.refreshToken, {
        secret: this.jwtSecret,
      });

      const user = await this.userRepository.findOneByOrFail({ id: decoded.id });
      if (await user.validateRefreshToken(refreshTokenDto.refreshToken)) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: UserEntity): Promise<AuthTokensDto> {
    const payload = new PayloadDto(user);
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

    await user.setRefreshToken(refreshToken);
    await this.userRepository.save(user);

    return {
      accessToken,
      refreshToken,
    };
  }
}
