import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { successResponse } from '../common/utils/api-response.util.js';

interface FindAllOptions {
  search?: string;
  limit?: number;
}

@Injectable()
export class CitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options: FindAllOptions = {}) {
    const { search, limit } = options;

    const cities = await this.prisma.city.findMany({
      where: search
        ? {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : undefined,
      orderBy: {
        name: 'asc',
      },
      take: limit && limit > 0 ? Math.min(limit, 100) : undefined,
      select: {
        id: true,
        name: true,
        country: true,
      },
    });

    return successResponse('Cities retrieved successfully', cities);
  }
}
