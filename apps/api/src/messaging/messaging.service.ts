import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { MatchStatus } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { successResponse } from '../common/utils/api-response.util.js';

import { CreateConversationDto } from './dto/create-conversation.dto.js';

@Injectable()
export class MessagingService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // CREATE / GET CONVERSATION
  // ============================================

  async createConversation(
    userId: string,
    dto: CreateConversationDto,
  ) {
    const targetUserId = dto.userId;

    // Don't allow a user to create a conversation with themselves
    if (userId === targetUserId) {
      throw new ConflictException(
        'You cannot create a conversation with yourself',
      );
    }

    // Make sure the other user exists
    const targetUser = await this.prisma.user.findUnique({
      where: {
        id: targetUserId,
      },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Only friends (accepted matches) can start a conversation
    const friendship = await this.prisma.match.findFirst({
      where: {
        status: MatchStatus.ACCEPTED,
        OR: [
          { senderId: userId, recipientId: targetUserId },
          { senderId: targetUserId, recipientId: userId },
        ],
      },
    });

    if (!friendship) {
      throw new ForbiddenException(
        'You can only start a conversation with friends',
      );
    }

    const [userOneId, userTwoId] = [
      userId,
      targetUserId,
    ].sort();

    // Check if conversation already exists
    const existingConversation =
      await this.prisma.conversation.findUnique({
        where: {
          userOneId_userTwoId: {
            userOneId,
            userTwoId,
          },
        },

        include: {
          userOne: {
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

          userTwo: {
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

          _count: {
            select: {
              messages: true,
            },
          },
        },
      });

    if (existingConversation) {
      return successResponse(
        'Conversation retrieved successfully',
        existingConversation,
      );
    }

    // Create new conversation
    const conversation = await this.prisma.conversation.create({
      data: {
        userOneId,
        userTwoId,
      },

      include: {
        userOne: {
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

        userTwo: {
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
      'Conversation created successfully',
      conversation,
    );
  }

  // ============================================
  // GET MY CONVERSATIONS
  // ============================================

  async findMyConversations(userId: string) {
    const conversations =
      await this.prisma.conversation.findMany({
        where: {
          OR: [
            {
              userOneId: userId,
            },
            {
              userTwoId: userId,
            },
          ],
        },

        include: {
          userOne: {
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

          userTwo: {
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

          messages: {
            take: 1,
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              content: true,
              senderId: true,
              createdAt: true,
            },
          },

          _count: {
            select: {
              messages: true,
            },
          },
        },

        orderBy: {
          lastMessageAt: 'desc',
        },
      });

    const payload = conversations.map(
      ({ messages: lastMessages, ...conversation }) => ({
        ...conversation,
        lastMessage: lastMessages[0] ?? null,
      }),
    );

    return successResponse(
      'Conversations retrieved successfully',
      payload,
    );
  }

  // ============================================
  // GET ONE CONVERSATION
  // ============================================

  async findOne(userId: string, conversationId: string) {
    const conversation =
      await this.prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },

        include: {
          userOne: {
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

          userTwo: {
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

    if (!conversation) {
      throw new NotFoundException(
        'Conversation not found',
      );
    }

    // Make sure this user belongs to the conversation
    if (
      conversation.userOneId !== userId &&
      conversation.userTwoId !== userId
    ) {
      throw new NotFoundException(
        'Conversation not found',
      );
    }

    return successResponse(
      'Conversation retrieved successfully',
      conversation,
    );
  }

  // ============================================
  // CHECK MEMBERSHIP
  // ============================================

  async verifyConversationMember(
    userId: string,
    conversationId: string,
  ) {
    const conversation =
      await this.prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
      });

    if (!conversation) {
      throw new NotFoundException(
        'Conversation not found',
      );
    }

    if (
      conversation.userOneId !== userId &&
      conversation.userTwoId !== userId
    ) {
      throw new NotFoundException(
        'Conversation not found',
      );
    }

    return conversation;
  }
}