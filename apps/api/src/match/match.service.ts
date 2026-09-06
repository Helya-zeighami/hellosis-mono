import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { MatchStatus } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { successResponse } from '../common/utils/api-response.util.js';
import { computeMatchScore } from '../common/utils/match-score.util.js';

@Injectable()
export class MatchService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // RECOMMENDATIONS
  // =========================

  async recommendations(userId: string) {
    const currentProfile = await this.prisma.profile.findUnique({
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

    if (!currentProfile) {
      throw new NotFoundException('Profile not found');
    }

    const currentInterestIds = new Set(
      currentProfile.interests.map(
        (userInterest) => userInterest.interestId,
      ),
    );

    const existingMatches = await this.prisma.match.findMany({
      where: {
        status: {
          in: [MatchStatus.PENDING, MatchStatus.ACCEPTED],
        },
        OR: [{ senderId: userId }, { recipientId: userId }],
      },
      select: {
        senderId: true,
        recipientId: true,
      },
    });

    const matchedUserIds = new Set<string>();
    for (const match of existingMatches) {
      matchedUserIds.add(
        match.senderId === userId ? match.recipientId : match.senderId,
      );
    }

    const profiles = await this.prisma.profile.findMany({
      where: {
        userId: {
          not: userId,
          notIn: Array.from(matchedUserIds),
        },
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

    const matches = profiles.map((profile) => {
      const sharedInterests = profile.interests.filter(
        (userInterest) =>
          currentInterestIds.has(userInterest.interestId),
      );

      const sameCity =
        currentProfile.cityId !== null &&
        currentProfile.cityId === profile.cityId;

      const score = computeMatchScore({
        currentInterestCount: currentProfile.interests.length,
        otherInterestCount: profile.interests.length,
        sharedInterestCount: sharedInterests.length,
        sameCity,
      });

      return {
        profile,
        sharedInterests,
        sameCity,
        score,
      };
    });

    matches.sort((a, b) => b.score - a.score);

    return successResponse(
      'Profiles discovered successfully',
      matches.map((match) => this.mapProfile(match)),
    );
  }

  // =========================
  // SEND REQUEST
  // =========================

  async sendRequest(userId: string, targetUserId: string) {
    if (!targetUserId) {
      throw new BadRequestException('Recipient user id is required');
    }

    if (targetUserId === userId) {
      throw new BadRequestException('You cannot send a match request to yourself');
    }

    const targetProfile = await this.prisma.profile.findUnique({
      where: {
        userId: targetUserId,
      },
    });

    if (!targetProfile) {
      throw new NotFoundException('Profile not found');
    }

    const existing = await this.prisma.match.findFirst({
      where: {
        OR: [
          { senderId: userId, recipientId: targetUserId },
          { senderId: targetUserId, recipientId: userId },
        ],
      },
    });

    if (existing) {
      if (existing.status === MatchStatus.ACCEPTED) {
        throw new ConflictException('You are already matched');
      }

      if (existing.status === MatchStatus.PENDING) {
        throw new ConflictException('A match request is already pending');
      }

      const resend = await this.prisma.match.update({
        where: {
          id: existing.id,
        },
        data: {
          status: MatchStatus.PENDING,
          respondedAt: null,
        },
      });

      return successResponse('Match request sent successfully', {
        id: resend.id,
        status: resend.status,
      });
    }

    const match = await this.prisma.match.create({
      data: {
        senderId: userId,
        recipientId: targetUserId,
      },
    });

    return successResponse('Match request sent successfully', {
      id: match.id,
      status: match.status,
    });
  }

  // =========================
  // INCOMING REQUESTS
  // =========================

  async getRequests(userId: string) {
    const currentProfile = await this.prisma.profile.findUnique({
      where: {
        userId,
      },
      include: {
        interests: {
          include: {
            interest: true,
          },
        },
      },
    });

    if (!currentProfile) {
      throw new NotFoundException('Profile not found');
    }

    const currentInterestIds = new Set(
      currentProfile.interests.map(
        (userInterest) => userInterest.interestId,
      ),
    );

    const requests = await this.prisma.match.findMany({
      where: {
        recipientId: userId,
        status: MatchStatus.PENDING,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        sender: {
          include: {
            profile: {
              include: {
                city: true,
                interests: {
                  include: {
                    interest: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return successResponse(
      'Match requests retrieved successfully',
      requests.map((request) => {
        const profile = request.sender.profile;

        const sharedInterests = profile
          ? profile.interests.filter(
              (userInterest) =>
                currentInterestIds.has(userInterest.interestId),
            )
          : [];

        const sameCity =
          profile !== null &&
          currentProfile.cityId !== null &&
          currentProfile.cityId === profile.cityId;

        const score = computeMatchScore({
          currentInterestCount: currentProfile.interests.length,
          otherInterestCount: profile ? profile.interests.length : 0,
          sharedInterestCount: sharedInterests.length,
          sameCity,
        });

        return {
          id: request.id,
          status: request.status,
          createdAt: request.createdAt,
          sender: {
            id: profile?.id ?? null,
            userId: request.senderId,
            firstName: profile?.firstName ?? null,
            lastName: profile?.lastName ?? null,
            bio: profile?.bio ?? null,
            avatarUrl: profile?.avatarUrl ?? null,
            city: profile?.city
              ? {
                  id: profile.city.id,
                  name: profile.city.name,
                }
              : null,
            interests: profile
              ? profile.interests.map((userInterest) => ({
                  id: userInterest.interest.id,
                  name: userInterest.interest.name,
                }))
              : [],
            sharedInterests: sharedInterests.map((userInterest) => ({
              id: userInterest.interest.id,
              name: userInterest.interest.name,
            })),
            sameCity,
            compatibility: Math.round(score * 100),
          },
        };
      }),
    );
  }

  // =========================
  // FRIENDS (ACCEPTED MATCHES)
  // =========================

  async getFriends(userId: string) {
    const currentProfile = await this.prisma.profile.findUnique({
      where: {
        userId,
      },
      include: {
        interests: {
          include: {
            interest: true,
          },
        },
      },
    });

    if (!currentProfile) {
      throw new NotFoundException('Profile not found');
    }

    const currentInterestIds = new Set(
      currentProfile.interests.map(
        (userInterest) => userInterest.interestId,
      ),
    );

    const matches = await this.prisma.match.findMany({
      where: {
        status: MatchStatus.ACCEPTED,
        OR: [
          { senderId: userId },
          { recipientId: userId },
        ],
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        sender: {
          include: {
            profile: {
              include: {
                city: true,
                interests: {
                  include: {
                    interest: true,
                  },
                },
              },
            },
          },
        },
        recipient: {
          include: {
            profile: {
              include: {
                city: true,
                interests: {
                  include: {
                    interest: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    type FriendPayload = ReturnType<
      typeof MatchService.prototype.mapProfile
    > & {
      matchId: string;
      matchedAt: Date | null;
    };

    const friends: FriendPayload[] = [];

    for (const match of matches) {
      const otherUser =
        match.senderId === userId
          ? match.recipient
          : match.sender;

      const profile = otherUser.profile;

      if (!profile) {
        continue;
      }

      const sharedInterests = profile.interests.filter(
        (userInterest) =>
          currentInterestIds.has(userInterest.interestId),
      );

      const sameCity =
        currentProfile.cityId !== null &&
        currentProfile.cityId === profile.cityId;

      const score = computeMatchScore({
        currentInterestCount:
          currentProfile.interests.length,
        otherInterestCount: profile.interests.length,
        sharedInterestCount: sharedInterests.length,
        sameCity,
      });

      friends.push({
        ...this.mapProfile({
          profile,
          sharedInterests,
          sameCity,
          score,
        }),
        matchId: match.id,
        matchedAt: match.respondedAt,
      });
    }

    return successResponse(
      'Friends retrieved successfully',
      friends,
    );
  }

  // =========================
  // ACCEPT REQUEST
  // =========================

  async acceptMatch(userId: string, matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: {
        id: matchId,
      },
    });

    if (!match) {
      throw new NotFoundException('Match request not found');
    }

    if (match.recipientId !== userId) {
      throw new NotFoundException('Match request not found');
    }

    if (match.status !== MatchStatus.PENDING) {
      throw new ConflictException('Match request is not pending');
    }

    const updated = await this.prisma.match.update({
      where: {
        id: match.id,
      },
      data: {
        status: MatchStatus.ACCEPTED,
        respondedAt: new Date(),
      },
    });

    return successResponse('Match accepted successfully', {
      id: updated.id,
      status: updated.status,
    });
  }

  // =========================
  // REJECT REQUEST
  // =========================

  async rejectMatch(userId: string, matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: {
        id: matchId,
      },
    });

    if (!match) {
      throw new NotFoundException('Match request not found');
    }

    if (match.recipientId !== userId) {
      throw new NotFoundException('Match request not found');
    }

    if (match.status !== MatchStatus.PENDING) {
      throw new ConflictException('Match request is not pending');
    }

    const updated = await this.prisma.match.update({
      where: {
        id: match.id,
      },
      data: {
        status: MatchStatus.REJECTED,
        respondedAt: new Date(),
      },
    });

    return successResponse('Match rejected successfully', {
      id: updated.id,
      status: updated.status,
    });
  }

  // =========================
  // HELPERS
  // =========================

  private mapProfile(match: {
    profile: {
      id: string;
      userId: string;
      firstName: string | null;
      lastName: string | null;
      bio: string | null;
      avatarUrl: string | null;
      city: { id: string; name: string } | null;
      interests: { interest: { id: string; name: string } }[];
    };
    sharedInterests: { interest: { id: string; name: string } }[];
    sameCity: boolean;
    score: number;
  }) {
    return {
      id: match.profile.id,
      userId: match.profile.userId,
      firstName: match.profile.firstName,
      lastName: match.profile.lastName,
      bio: match.profile.bio,
      avatarUrl: match.profile.avatarUrl,
      city: match.profile.city
        ? {
            id: match.profile.city.id,
            name: match.profile.city.name,
          }
        : null,
      interests: match.profile.interests.map((userInterest) => ({
        id: userInterest.interest.id,
        name: userInterest.interest.name,
      })),
      sharedInterests: match.sharedInterests.map((userInterest) => ({
        id: userInterest.interest.id,
        name: userInterest.interest.name,
      })),
      sameCity: match.sameCity,
      compatibility: Math.round(match.score * 100),
    };
  }
}
