import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { successResponse } from '../common/utils/api-response.util.js';

import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { FindEventsDto } from './dto/find-events.dto.js';
import { CreateEventCommentDto } from './dto/create-event-comment.dto.js';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  // =====================================================
  // CREATE EVENT
  // =====================================================

  async create(userId: string, dto: CreateEventDto) {
    const city = await this.prisma.city.findUnique({
      where: {
        id: dto.cityId,
      },
    });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    const event = await this.prisma.event.create({
      data: {
        creatorId: userId,

        cityId: dto.cityId,

        title: dto.title,

        description: dto.description,

        startTime: new Date(dto.startTime),

        endTime: dto.endTime ? new Date(dto.endTime) : null,
      },

      include: {
        city: true,

        creator: {
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
            likes: true,
            dislikes: true,
            comments: true,
          },
        },
      },
    });

    return successResponse('Event created successfully', event);
  }

  // =====================================================
  // GET ALL EVENTS
  // =====================================================

  async findAll(query: FindEventsDto) {
    const { search, cityId, page = 1, limit = 20 } = query;

    const events = await this.prisma.event.findMany({
      where: {
        startTime: {
          gte: new Date(),
        },

        ...(cityId && {
          cityId,
        }),

        ...(search && {
          OR: [
            {
              title: {
                contains: search,
                mode: 'insensitive',
              },
            },

            {
              description: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        }),
      },

      include: {
        city: true,

        creator: {
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
            likes: true,
            dislikes: true,
            comments: true,
          },
        },
      },

      skip: (page - 1) * limit,

      take: limit,

      orderBy: {
        startTime: 'asc',
      },
    });

    return successResponse('Events retrieved successfully', events);
  }

  // =====================================================
  // GET ONE EVENT
  // =====================================================

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: {
        id,
      },

      include: {
        city: true,

        creator: {
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
            likes: true,
            dislikes: true,
            comments: true,
          },
        },

        comments: {
          orderBy: {
            createdAt: 'desc',
          },

          include: {
            user: {
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
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return successResponse('Event retrieved successfully', event);
  }

  // =====================================================
  // UPDATE EVENT
  // =====================================================

  async update(userId: string, eventId: string, dto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.creatorId !== userId) {
      throw new ForbiddenException('You cannot update this event');
    }

   
    if (dto.cityId) {
      const city = await this.prisma.city.findUnique({
        where: {
          id: dto.cityId,
        },
      });

      if (!city) {
        throw new NotFoundException('City not found');
      }
    }

    const updatedEvent = await this.prisma.event.update({
      where: {
        id: eventId,
      },

      data: {
        ...(dto.title !== undefined && {
          title: dto.title,
        }),

        ...(dto.description !== undefined && {
          description: dto.description,
        }),

        ...(dto.cityId !== undefined && {
          cityId: dto.cityId,
        }),

        ...(dto.startTime !== undefined && {
          startTime: new Date(dto.startTime),
        }),

        ...(dto.endTime !== undefined && {
          endTime: new Date(dto.endTime),
        }),
      },

      include: {
        city: true,

        _count: {
          select: {
            likes: true,
            dislikes: true,
            comments: true,
          },
        },
      },
    });

    return successResponse('Event updated successfully', updatedEvent);
  }

  // =====================================================
  // DELETE EVENT
  // =====================================================

  async remove(userId: string, eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Only creator can delete
    if (event.creatorId !== userId) {
      throw new ForbiddenException('You cannot delete this event');
    }

    await this.prisma.event.delete({
      where: {
        id: eventId,
      },
    });

    return successResponse('Event deleted successfully', null);
  }

  // =====================================================
  // TOGGLE LIKE
  // =====================================================

  async toggleLike(userId: string, eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const existingLike = await this.prisma.eventLike.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existingLike) {
      await this.prisma.eventLike.delete({
        where: {
          id: existingLike.id,
        },
      });

      return successResponse('Like removed', {
        liked: false,
        disliked: false,
      });
    }

    const existingDislike = await this.prisma.eventDislike.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    // Switch dislike → like
    await this.prisma.$transaction(async (tx) => {
      if (existingDislike) {
        await tx.eventDislike.delete({
          where: {
            id: existingDislike.id,
          },
        });
      }

      await tx.eventLike.create({
        data: {
          eventId,
          userId,
        },
      });
    });

    return successResponse('Event liked successfully', {
      liked: true,
      disliked: false,
    });
  }

  // =====================================================
  // TOGGLE DISLIKE
  // =====================================================

  async toggleDislike(userId: string, eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const existingDislike = await this.prisma.eventDislike.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    // Already disliked → remove dislike
    if (existingDislike) {
      await this.prisma.eventDislike.delete({
        where: {
          id: existingDislike.id,
        },
      });

      return successResponse('Dislike removed', {
        liked: false,
        disliked: false,
      });
    }

    // Check if user liked the event
    const existingLike = await this.prisma.eventLike.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    // Switch like → dislike
    await this.prisma.$transaction(async (tx) => {
      if (existingLike) {
        await tx.eventLike.delete({
          where: {
            id: existingLike.id,
          },
        });
      }

      await tx.eventDislike.create({
        data: {
          eventId,
          userId,
        },
      });
    });

    return successResponse('Event disliked successfully', {
      liked: false,
      disliked: true,
    });
  }

  // =====================================================
  // GET COMMENTS
  // =====================================================

  async getComments(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const comments = await this.prisma.eventComment.findMany({
      where: {
        eventId,
      },

      include: {
        user: {
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

      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse('Comments retrieved successfully', comments);
  }

  // =====================================================
  // CREATE COMMENT
  // =====================================================

  async createComment(userId: string, eventId: string, dto: CreateEventCommentDto) {
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const comment = await this.prisma.eventComment.create({
      data: {
        eventId,

        userId,

        content: dto.content,
      },

      include: {
        user: {
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

    return successResponse('Comment created successfully', comment);
  }

  // =====================================================
  // DELETE COMMENT
  // =====================================================

  async deleteComment(userId: string, eventId: string, commentId: string) {
    const comment = await this.prisma.eventComment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.eventId !== eventId) {
      throw new NotFoundException('Comment not found for this event');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You cannot delete this comment');
    }

    await this.prisma.eventComment.delete({
      where: {
        id: commentId,
      },
    });

    return successResponse('Comment deleted successfully', null);
  }
}
