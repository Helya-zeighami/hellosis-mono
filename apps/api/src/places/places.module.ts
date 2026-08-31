import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { PlacesService } from "./places.service.js";
import { PlacesController } from "./places.controller.js";

@Module({
  providers: [PlacesService],
  controllers: [PlacesController],
  imports: [PrismaModule],
})
export class PlacesModule {}
