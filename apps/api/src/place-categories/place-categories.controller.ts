import { Controller, Get } from "@nestjs/common";
import { PlaceCategoriesService } from "./place-categories.service.js";

@Controller("place-categories")
export class PlaceCategoriesController {
  constructor(
    private readonly placeCategoriesService: PlaceCategoriesService,
  ) {}

  @Get()
  async findAll() {
    return this.placeCategoriesService.findAll();
  }
}
