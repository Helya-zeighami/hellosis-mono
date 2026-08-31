import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { successResponse } from "../common/utils/api-response.util.js";

@Injectable()
export class PlaceCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.placeCategory.findMany({
      orderBy: { name: "asc" },
    });

    return successResponse(
      "Place categories retrieved successfully",
      categories,
    );
  }
}
