import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { successResponse } from '../common/utils/api-response.util.js';

import { UpdateInterestDto } from './dto/update-interest.dto.js';
import { CreateInterestDto } from './dto/create-intereset.dto.js';

@Injectable()
export class InterestService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // GET ALL
  // =========================

  async findAll() {
    const interests = await this.prisma.interest.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return successResponse(
      'Interests retrieved successfully',
      interests,
    );
  }

  // =========================
  // GET ONE
  // =========================

  async findOne(id: string) {
    const interest = await this.prisma.interest.findUnique({
      where: {
        id,
      },
    });

    if (!interest) {
      throw new NotFoundException('Interest not found');
    }

    return successResponse(
      'Interest retrieved successfully',
      interest,
    );
  }

  // =========================
  // CREATE - ADMIN
  // =========================

  async create(dto: CreateInterestDto) {
    const existingInterest =
      await this.prisma.interest.findUnique({
        where: {
          name: dto.name,
        },
      });

    if (existingInterest) {
      throw new ConflictException(
        'Interest already exists',
      );
    }

    const interest = await this.prisma.interest.create({
      data: {
        name: dto.name,
      },
    });

    return successResponse(
      'Interest created successfully',
      interest,
    );
  }

  // =========================
  // UPDATE - ADMIN
  // =========================

  async update(
    id: string,
    dto: UpdateInterestDto,
  ) {
    const interest =
      await this.prisma.interest.findUnique({
        where: {
          id,
        },
      });

    if (!interest) {
      throw new NotFoundException('Interest not found');
    }

    const existingInterest =
      await this.prisma.interest.findUnique({
        where: {
          name: dto.name,
        },
      });

    if (
      existingInterest &&
      existingInterest.id !== id
    ) {
      throw new ConflictException(
        'Interest already exists',
      );
    }

    const updatedInterest =
      await this.prisma.interest.update({
        where: {
          id,
        },
        data: {
          name: dto.name,
        },
      });

    return successResponse(
      'Interest updated successfully',
      updatedInterest,
    );
  }

  // =========================
  // DELETE - ADMIN
  // =========================

  async remove(id: string) {
    const interest =
      await this.prisma.interest.findUnique({
        where: {
          id,
        },
      });

    if (!interest) {
      throw new NotFoundException('Interest not found');
    }

    await this.prisma.interest.delete({
      where: {
        id,
      },
    });

    return successResponse(
      'Interest deleted successfully',
      null,
    );
  }
}