import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { successResponse } from '../common/utils/api-response.util.js';

import { SendGroupMessageDto } from './dto/send-group-message.dto.js';
import { FindGroupMessagesDto } from './dto/find-group-messages.dto.js';

@Injectable()
export class GroupMessagingService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // VERIFY GROUP MEMBERSHIP
  // ============================================

  async verifyGroupMember(
    userId: string,
    groupId: string,
  ) {
    const group = await this.prisma.group.findFirst({
      where: {
        id: groupId,

        members: {
          some: {
            userId,
          },
        },
      },

      select: {
        id: true,
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group;
  }

  // ============================================
  // SEND GROUP MESSAGE
  // ============================================

  async sendMessage(
    userId: string,
    dto: SendGroupMessageDto,
  ) {
    const content =
      typeof dto.content === 'string'
        ? dto.content.trim()
        : '';

    if (!content) {
      throw new BadRequestException(
        'Message content cannot be empty',
      );
    }

    if (content.length > 2000) {
      throw new BadRequestException(
        'Message content is too long',
      );
    }

    // The authenticated user must be a member
    // of the group before sending.
    await this.verifyGroupMember(userId, dto.groupId);

    const message =
      await this.prisma.groupMessage.create({
        data: {
          groupId: dto.groupId,

          senderId: userId,

          content,
        },

        include: {
          sender: {
            select: {
              id: true,

              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

    return message;
  }

  // ============================================
  // GET GROUP MESSAGES
  // ============================================

  async findMessages(
    userId: string,
    groupId: string,
    dto: FindGroupMessagesDto,
  ) {
    // Only members can read the group history.
    await this.verifyGroupMember(userId, groupId);

    const messages =
      await this.prisma.groupMessage.findMany({
        where: {
          groupId,

          ...(dto.cursor
            ? {
                id: {
                  lt: dto.cursor,
                },
              }
            : {}),
        },

        orderBy: {
          createdAt: 'desc',
        },

        take: dto.limit,

        include: {
          sender: {
            select: {
              id: true,

              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

    return successResponse(
      'Messages retrieved successfully',
      messages,
    );
  }
}