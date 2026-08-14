import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { UpdateProfileDto } from './dto/update-profile.dto.js';

import { successResponse } from '../common/utils/api-response.util.js';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =========================
  // GET PROFILE
  // =========================

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: {
        userId,
      },

      include: {
        city: true,

        interests: {
          include: {
            interest: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException(
        'Profile not found',
      );
    }

    return successResponse(
      'Profile retrieved successfully',
      {
        id: profile.id,

        firstName: profile.firstName,
        lastName: profile.lastName,
        birthDate: profile.birthDate,

        bio: profile.bio,
        avatarUrl: profile.avatarUrl,

        city: profile.city,

        interests: profile.interests.map(
          (userInterest) => ({
            id: userInterest.interest.id,
            name: userInterest.interest.name,
          }),
        ),
      },
    );
  }

  // =========================
  // UPDATE PROFILE
  // =========================

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ) {
    const profile =
      await this.prisma.profile.findUnique({
        where: {
          userId,
        },
      });

    if (!profile) {
      throw new NotFoundException(
        'Profile not found',
      );
    }

    const updatedProfile =
      await this.prisma.profile.update({
        where: {
          userId,
        },

        data: {
          bio: dto.bio,
          avatarUrl: dto.avatarUrl,
          cityId: dto.cityId,
        },

        include: {
          city: true,

          interests: {
            include: {
              interest: true,
            },
          },
        },
      });

    return successResponse(
      'Profile updated successfully',
      {
        id: updatedProfile.id,

        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        birthDate: updatedProfile.birthDate,

        bio: updatedProfile.bio,
        avatarUrl: updatedProfile.avatarUrl,

        city: updatedProfile.city,

        interests:
          updatedProfile.interests.map(
            (userInterest) => ({
              id: userInterest.interest.id,
              name: userInterest.interest.name,
            }),
          ),
      },
    );
  }

  // =========================
  // ADD INTEREST
  // =========================

  async addInterest(
    userId: string,
    interestId: string,
  ) {
    const profile =
      await this.prisma.profile.findUnique({
        where: {
          userId,
        },
      });

    if (!profile) {
      throw new NotFoundException(
        'Profile not found',
      );
    }

    // Check that the interest exists
    const interest =
      await this.prisma.interest.findUnique({
        where: {
          id: interestId,
        },
      });

    if (!interest) {
      throw new NotFoundException(
        'Interest not found',
      );
    }

    // Check whether already selected
    const existing =
      await this.prisma.userInterest.findUnique({
        where: {
          profileId_interestId: {
            profileId: profile.id,
            interestId,
          },
        },
      });

    if (existing) {
      throw new ConflictException(
        'Interest already added to profile',
      );
    }

    await this.prisma.userInterest.create({
      data: {
        profileId: profile.id,
        interestId,
      },
    });

    return successResponse(
      'Interest added successfully',
      {
        id: interest.id,
        name: interest.name,
      },
    );
  }

  // =========================
  // REMOVE INTEREST
  // =========================

  async removeInterest(
    userId: string,
    interestId: string,
  ) {
    const profile =
      await this.prisma.profile.findUnique({
        where: {
          userId,
        },
      });

    if (!profile) {
      throw new NotFoundException(
        'Profile not found',
      );
    }

    const existing =
      await this.prisma.userInterest.findUnique({
        where: {
          profileId_interestId: {
            profileId: profile.id,
            interestId,
          },
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Interest is not in this profile',
      );
    }

    await this.prisma.userInterest.delete({
      where: {
        profileId_interestId: {
          profileId: profile.id,
          interestId,
        },
      },
    });

    return successResponse(
      'Interest removed successfully',
      null,
    );
  }
}