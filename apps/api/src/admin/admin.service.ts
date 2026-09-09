import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { successResponse } from '../common/utils/api-response.util.js';

import { ApprovalStatus } from '../../generated/prisma/enums.js';
import { AdminFindDto } from './dto/admin-find.dto.js';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // =====================================================
  // EVENTS
  // =====================================================

  async listEvents(query: AdminFindDto) {
    const { status, page = 1, limit = 20 } = query;

    const events = await this.prisma.event.findMany({
      where: {
        ...(status ? { approvalStatus: status } : {}),
      },
      include: {
        city: true,
        creator: {
          select: {
            id: true,
            phoneNumber: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        approvedBy: {
          select: {
            id: true,
            phoneNumber: true,
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
        createdAt: 'desc',
      },
    });

    return successResponse('Events retrieved successfully', events);
  }

  async approveEvent(adminId: string, eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.approvalStatus === ApprovalStatus.APPROVED) {
      throw new ConflictException('Event is already approved');
    }

    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        approvalStatus: ApprovalStatus.APPROVED,
        approvedById: adminId,
        approvedAt: new Date(),
      },
      include: { city: true },
    });

    return successResponse('Event approved successfully', updated);
  }

  async rejectEvent(adminId: string, eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.approvalStatus === ApprovalStatus.REJECTED) {
      throw new ConflictException('Event is already rejected');
    }

    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: {
        approvalStatus: ApprovalStatus.REJECTED,
        approvedById: adminId,
        approvedAt: new Date(),
      },
      include: { city: true },
    });

    return successResponse('Event rejected successfully', updated);
  }

  // =====================================================
  // PLACES
  // =====================================================

  async listPlaces(query: AdminFindDto) {
    const { status, page = 1, limit = 20 } = query;

    const places = await this.prisma.place.findMany({
      where: {
        ...(status ? { approvalStatus: status } : {}),
      },
      include: {
        city: true,
        category: true,
        createdBy: {
          select: {
            id: true,
            phoneNumber: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        approvedBy: {
          select: {
            id: true,
            phoneNumber: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse('Places retrieved successfully', places);
  }

  async approvePlace(adminId: string, placeId: string) {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    if (place.approvalStatus === ApprovalStatus.APPROVED) {
      throw new ConflictException('Place is already approved');
    }

    const updated = await this.prisma.place.update({
      where: { id: placeId },
      data: {
        approvalStatus: ApprovalStatus.APPROVED,
        approvedById: adminId,
        approvedAt: new Date(),
      },
      include: { city: true, category: true },
    });

    return successResponse('Place approved successfully', updated);
  }

  async rejectPlace(adminId: string, placeId: string) {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    if (place.approvalStatus === ApprovalStatus.REJECTED) {
      throw new ConflictException('Place is already rejected');
    }

    const updated = await this.prisma.place.update({
      where: { id: placeId },
      data: {
        approvalStatus: ApprovalStatus.REJECTED,
        approvedById: adminId,
        approvedAt: new Date(),
      },
      include: { city: true, category: true },
    });

    return successResponse('Place rejected successfully', updated);
  }

  // =====================================================
  // USERS (role management)
  // =====================================================

  async listUsers(query: AdminFindDto) {
    const { page = 1, limit = 20 } = query;

    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        phoneNumber: true,
        role: true,
        isVerified: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse('Users retrieved successfully', users);
  }

  async updateUserRole(adminId: string, userId: string, dto: UpdateUserRoleDto) {
    if (adminId === userId) {
      throw new ConflictException('You cannot change your own role');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role: dto.role },
      select: {
        id: true,
        phoneNumber: true,
        role: true,
        isVerified: true,
      },
    });

    return successResponse('User role updated successfully', updated);
  }
}