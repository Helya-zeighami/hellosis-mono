import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { successResponse } from '../common/utils/api-response.util.js';

@Injectable()
export class CitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const cities = await this.prisma.city.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
    });

    return successResponse(
      'Cities retrieved successfully',
      cities,
    );
  }
}