import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { PlaceCategoriesService } from "./place-categories.service.js";
import { PlaceCategoriesController } from "./place-categories.controller.js";

@Module({
  providers: [PlaceCategoriesService],
  controllers: [PlaceCategoriesController],
  imports: [PrismaModule],
})
export class PlaceCategoriesModule {}
