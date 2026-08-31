import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";
import { successResponse } from "../common/utils/api-response.util.js";

import { CreatePlaceDto } from "./dto/create-place.dto.js";
import { UpdatePlaceDto } from "./dto/update-place.dto.js";
import { FindPlacesDto } from "./dto/find-places.dto.js";

@Injectable()
export class PlacesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly placeInclude = {
    city: true,
    category: true,
    createdBy: {
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
  };

  // =====================================================
  // CREATE PLACE
  // =====================================================

  async create(userId: string, dto: CreatePlaceDto) {
    if (dto.cityId) {
      const city = await this.prisma.city.findUnique({
        where: { id: dto.cityId },
      });
      if (!city) {
        throw new NotFoundException("City not found");
      }
    }

    if (dto.categoryId) {
      const category = await this.prisma.placeCategory.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException("Category not found");
      }
    }

    const place = await this.prisma.place.create({
      data: {
        name: dto.name,
        description: dto.description,
        cityId: dto.cityId,
        address: dto.address,
        categoryId: dto.categoryId,
        imageUrl: dto.imageUrl,
        createdById: userId,
      },
      include: this.placeInclude,
    });

    return successResponse("Place created successfully", place);
  }

  // =====================================================
  // GET ALL PLACES
  // =====================================================

  async findAll(query: FindPlacesDto) {
    const { search, cityId, categoryId, page = 1, limit = 20 } = query;

    const places = await this.prisma.place.findMany({
      where: {
        ...(cityId && { cityId }),
        ...(categoryId && { categoryId }),
        ...(search && {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }),
      },

      include: this.placeInclude,

      skip: (page - 1) * limit,
      take: limit,

      orderBy: {
        createdAt: "desc",
      },
    });

    return successResponse("Places retrieved successfully", places);
  }

  // =====================================================
  // GET ONE PLACE
  // =====================================================

  async findOne(id: string) {
    const place = await this.prisma.place.findUnique({
      where: { id },
      include: this.placeInclude,
    });

    if (!place) {
      throw new NotFoundException("Place not found");
    }

    return successResponse("Place retrieved successfully", place);
  }

  // =====================================================
  // UPDATE PLACE
  // =====================================================

  async update(userId: string, placeId: string, dto: UpdatePlaceDto) {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundException("Place not found");
    }

    if (place.createdById !== userId) {
      throw new ForbiddenException("You cannot update this place");
    }

    if (dto.cityId) {
      const city = await this.prisma.city.findUnique({
        where: { id: dto.cityId },
      });
      if (!city) {
        throw new NotFoundException("City not found");
      }
    }

    if (dto.categoryId) {
      const category = await this.prisma.placeCategory.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException("Category not found");
      }
    }

    const updatedPlace = await this.prisma.place.update({
      where: { id: placeId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
        ...(dto.cityId !== undefined && { cityId: dto.cityId }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
      },
      include: this.placeInclude,
    });

    return successResponse("Place updated successfully", updatedPlace);
  }

  // =====================================================
  // DELETE PLACE
  // =====================================================

  async remove(userId: string, placeId: string) {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundException("Place not found");
    }

    if (place.createdById !== userId) {
      throw new ForbiddenException("You cannot delete this place");
    }

    await this.prisma.place.delete({
      where: { id: placeId },
    });

    return successResponse("Place deleted successfully", null);
  }
}
