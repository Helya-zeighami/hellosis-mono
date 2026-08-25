import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { successResponse } from '../common/utils/api-response.util.js';

import { CreateGroupDto } from './dto/create-group.dto.js';
import { UpdateGroupDto } from './dto/update-group.dto.js';
import { FindGroupsDto } from './dto/find-groups.dto.js';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateGroupDto) {
    const group = await this.prisma.group.create({
      data: {
        name: dto.name,

        description: dto.description,

        imageUrl: dto.imageUrl,

        cityId: dto.cityId,

        creatorId: userId,

        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },

      include: {
        members: true,
      },
    });

    return successResponse('Group created successfully', group);
  }

  async findAll(query: FindGroupsDto) {
    const { search, cityId, page = 1, limit = 20 } = query;

    const groups = await this.prisma.group.findMany({
      where: {
        ...(cityId && {
          cityId,
        }),

        ...(search && {
          OR: [
            {
              name: {
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

                avatarUrl: true,
              },
            },
          },
        },

        _count: {
          select: {
            members: true,
          },
        },
      },

      skip: (page - 1) * limit,

      take: limit,

      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse('Groups retrieved successfully', groups);
  }

  async findOne(id: string) {
    const group = await this.prisma.group.findUnique({
      where: {
        id,
      },

      include: {
        city: true,

        creator: {
          select: {
            id: true,

            profile: true,
          },
        },

        members: {
          include: {
            user: {
              select: {
                id: true,

                profile: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return successResponse('Group retrieved successfully', group);
  }

  async update(userId: string, groupId: string, dto: UpdateGroupDto) {
    const member = await this.getMember(userId, groupId);

    if (member.role !== 'OWNER' && member.role !== 'ADMIN') {
      throw new ForbiddenException('You cannot update this group');
    }

    const group = await this.prisma.group.update({
      where: {
        id: groupId,
      },

      data: {
        name: dto.name,

        description: dto.description,

        imageUrl: dto.imageUrl,

        cityId: dto.cityId,
      },
    });

    return successResponse('Group updated successfully', group);
  }

  async remove(userId: string, groupId: string) {
    const member = await this.getMember(userId, groupId);

    if (member.role !== 'OWNER') {
      throw new ForbiddenException('Only owner can delete group');
    }

    await this.prisma.group.delete({
      where: {
        id: groupId,
      },
    });

    return successResponse('Group deleted successfully', null);
  }

  async join(userId: string, groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: {
        id: groupId,
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const existingMember = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,

          userId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('Already joined this group');
    }

    const member = await this.prisma.groupMember.create({
      data: {
        groupId,

        userId,

        role: 'MEMBER',
      },
    });

    return successResponse('Joined group successfully', member);
  }

  async leave(userId: string, groupId: string) {
    const member = await this.getMember(userId, groupId);

    if (member.role === 'OWNER') {
      throw new ForbiddenException('Owner cannot leave group');
    }

    await this.prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,

          userId,
        },
      },
    });

    return successResponse('Left group successfully', null);
  }

  private async getMember(userId: string, groupId: string) {
    const member = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,

          userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return member;
  }
}
