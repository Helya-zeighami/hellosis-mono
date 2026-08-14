import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomInt } from 'node:crypto';

import { PrismaService } from '../prisma/prisma.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { successResponse } from '../common/utils/api-response.util.js';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const phoneNumber = dto.phoneNumber;

    const existingUser = await this.prisma.user.findUnique({
      where: {
        phoneNumber,
      },
    });

    if (existingUser) {
      throw new ConflictException('Unable to create account');
    }

    const otp = randomInt(100000, 1000000).toString();

    const codeHash = createHash('sha256').update(otp).digest('hex');

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.user.create({
      data: {
        phoneNumber,
        isVerified: false,
      },
    });

    await this.prisma.otpChallenge.create({
      data: {
        phoneNumber,
        codeHash,
        expiresAt,
      },
    });

    return successResponse('OTP generated successfully', {
      expiresAt,
      developmentOtp: otp,
    });
  }
  private async generateTokens(userId: string) {
    const payload = {
      sub: userId,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      expiresIn: '30d',
    });

    const refreshTokenHash = createHash('sha256').update(refreshToken).digest('hex');

    await this.prisma.session.create({
      data: {
        userId,

        refreshTokenHash,

        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
  async login(dto: LoginDto) {
    const { phoneNumber, otp } = dto;

    const user = await this.prisma.user.findUnique({
      where: {
        phoneNumber,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const challenge = await this.prisma.otpChallenge.findFirst({
      where: {
        phoneNumber,

        consumedAt: null,

        expiresAt: {
          gt: new Date(),
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!challenge) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const otpHash = createHash('sha256').update(otp).digest('hex');

    if (otpHash !== challenge.codeHash) {
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.prisma.otpChallenge.update({
      where: {
        id: challenge.id,
      },

      data: {
        consumedAt: new Date(),
      },
    });

    const tokens = await this.generateTokens(user.id);

    return successResponse('Login successful', {
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
      },

      ...tokens,
    });
  }
}
