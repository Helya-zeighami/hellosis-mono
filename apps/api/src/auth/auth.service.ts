import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomInt } from 'node:crypto';

import { PrismaService } from '../prisma/prisma.service.js';
import { successResponse } from '../common/utils/api-response.util.js';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const { phoneNumber, otp } = dto;

    let user = await this.prisma.user.findUnique({
      where: {
        phoneNumber,
      },
    });

    /*
      STEP 1:
      User enters phone number
    */
    if (!otp) {
      // create user if doesn't exist
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            phoneNumber,
            isVerified: false,
             profile:{
            create:{}
          }
          },
         
        });
      }

      const code = randomInt(100000, 1000000).toString();

      const codeHash = createHash('sha256').update(code).digest('hex');

      await this.prisma.otpChallenge.create({
        data: {
          phoneNumber,
          codeHash,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      });

      return successResponse('OTP sent successfully', {
        developmentOtp: code,
      });
    }

    /*
      STEP 2:
      Verify OTP
    */

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
      throw new UnauthorizedException('OTP expired');
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

    // mark verified
    if (!user.isVerified) {
      user = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          isVerified: true,
        },
      });
    }

    const tokens = await this.generateTokens(user.id);

    return successResponse('Login successful', {
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
      },
      ...tokens,
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

  async logout(refreshToken: string) {
    const refreshTokenHash = createHash('sha256').update(refreshToken).digest('hex');

    const session = await this.prisma.session.findFirst({
      where: {
        refreshTokenHash,
      },
    });

    if (!session) {
      return successResponse('Already logged out', null);
    }

    await this.prisma.session.delete({
      where: {
        id: session.id,
      },
    });

    return successResponse('Logout successful', null);
  }
}
