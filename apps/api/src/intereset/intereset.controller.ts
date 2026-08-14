import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';



import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateInterestDto } from './dto/create-intereset.dto.js';
import { UpdateInterestDto } from './dto/update-interest.dto.js';
import { InterestService } from './interest.service.js';

@Controller('interests')
@UseGuards(JwtAuthGuard)

export class InterestController {
  constructor(private readonly interestService: InterestService) {}

  // Normal authenticated users can see interests

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.interestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.interestService.findOne(id);
  }

  // Admin endpoints

  @Post()
  create(@Body() dto: CreateInterestDto) {
    return this.interestService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInterestDto) {
    return this.interestService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.interestService.remove(id);
  }
}
