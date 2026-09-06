import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { successResponse } from '../common/utils/api-response.util.js';

import { SendMessageDto } from './dto/send-message.dto.js';
import { FindMessagesDto } from './dto/find-messages.dto.js';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ============================================
  // SEND MESSAGE
  // ============================================

  async sendMessage(
    userId: string,
    dto: SendMessageDto,
  ) {
    // First make sure the user belongs to this conversation
    const conversation =
      await this.prisma.conversation.findUnique({
        where: {
          id: dto.conversationId,
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

    // Create the message
    const message = await this.prisma.message.create({
      data: {
        conversationId: dto.conversationId,
        senderId: userId,
        content: dto.content,
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

    // Update the conversation's last message time
    await this.prisma.conversation.update({
      where: {
        id: dto.conversationId,
      },

      data: {
        lastMessageAt: message.createdAt,
      },
    });

    return successResponse(
      'Message sent successfully',
      message,
    );
  }

  // ============================================
  // GET MESSAGES
  // ============================================

  async findMessages(
    userId: string,
    conversationId: string,
    dto: FindMessagesDto,
  ) {
    // Make sure user belongs to conversation
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

    const messages =
      await this.prisma.message.findMany({
        where: {
          conversationId,

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