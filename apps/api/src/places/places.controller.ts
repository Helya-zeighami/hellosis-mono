import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";

import { PlacesService } from "./places.service.js";

import { CreatePlaceDto } from "./dto/create-place.dto.js";
import { UpdatePlaceDto } from "./dto/update-place.dto.js";
import { FindPlacesDto } from "./dto/find-places.dto.js";

import type { AuthenticationRequest } from "../common/interfaces/authentication-request.interface.js";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";

@Controller("places")
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  // =========================
  // GET ALL PLACES (public)
  // =========================

  @Get()
  async findAll(@Query() query: FindPlacesDto) {
    return this.placesService.findAll(query);
  }

  // =========================
  // GET ONE PLACE (public)
  // =========================

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.placesService.findOne(id);
  }

  // =========================
  // CREATE PLACE (authenticated)
  // =========================

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req: AuthenticationRequest,
    @Body() dto: CreatePlaceDto,
  ) {
    return this.placesService.create(req.user.id, dto);
  }

  // =========================
  // UPDATE PLACE (authenticated, creator only)
  // =========================

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  async update(
    @Req() req: AuthenticationRequest,
    @Param("id") id: string,
    @Body() dto: UpdatePlaceDto,
  ) {
    return this.placesService.update(req.user.id, id, dto);
  }

  // =========================
  // DELETE PLACE (authenticated, creator only)
  // =========================

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async remove(
    @Req() req: AuthenticationRequest,
    @Param("id") id: string,
  ) {
    return this.placesService.remove(req.user.id, id);
  }
}
