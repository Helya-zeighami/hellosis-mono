import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CitiesService } from './cities.service.js';

@Controller('cities')
@UseGuards(JwtAuthGuard)
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  findAll() {
    return this.citiesService.findAll();
  }
}
