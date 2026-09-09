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
} from '@nestjs/common';


import { EventsService } from './events.service.js';

import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { FindEventsDto } from './dto/find-events.dto.js';

import type { AuthenticationRequest } from '../common/interfaces/authentication-request.interface.js';
import { CreateEventCommentDto } from './dto/create-event-comment.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
  ) {}

  // =========================
  // GET ALL EVENTS
  // =========================

  @Get()
  async findAll(
    @Req() req: AuthenticationRequest,
    @Query() query: FindEventsDto,
  ) {
    return this.eventsService.findAll(req.user, query);
  }

  // =========================
  // GET ONE EVENT
  // =========================

  @Get(':id')
  async findOne(
    @Req() req: AuthenticationRequest,
    @Param('id') id: string,
  ) {
    return this.eventsService.findOne(id, req.user);
  }

  // =========================
  // CREATE EVENT
  // =========================

  @Post()
  async create(
    @Req() req: AuthenticationRequest,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventsService.create(
      req.user.id,
      dto,
    );
  }

  // =========================
  // UPDATE EVENT
  // =========================

  @Patch(':id')
  async update(
    @Req() req: AuthenticationRequest,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(
      req.user,
      id,
      dto,
    );
  }

  // =========================
  // DELETE EVENT
  // =========================

  @Delete(':id')
  async remove(
    @Req() req: AuthenticationRequest,
    @Param('id') id: string,
  ) {
    return this.eventsService.remove(
      req.user,
      id,
    );
  }

  // =========================
  // TOGGLE LIKE
  // =========================

  @Post(':id/like')
  async toggleLike(
    @Req() req: AuthenticationRequest,
    @Param('id') eventId: string,
  ) {
    return this.eventsService.toggleLike(
      req.user.id,
      eventId,
    );
  }

  // =========================
  // TOGGLE DISLIKE
  // =========================

  @Post(':id/dislike')
  async toggleDislike(
    @Req() req: AuthenticationRequest,
    @Param('id') eventId: string,
  ) {
    return this.eventsService.toggleDislike(
      req.user.id,
      eventId,
    );
  }

  // =========================
  // GET COMMENTS
  // =========================

  @Get(':id/comments')
  async getComments(
    @Param('id') eventId: string,
  ) {
    return this.eventsService.getComments(eventId);
  }

  // =========================
  // CREATE COMMENT
  // =========================

  @Post(':id/comments')
  async createComment(
    @Req() req: AuthenticationRequest,
    @Param('id') eventId: string,
    @Body() dto: CreateEventCommentDto,
  ) {
    return this.eventsService.createComment(
      req.user.id,
      eventId,
      dto,
    );
  }

  // =========================
  // DELETE COMMENT
  // =========================

  @Delete(':eventId/comments/:commentId')
  async deleteComment(
    @Req() req: AuthenticationRequest,
    @Param('eventId') eventId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.eventsService.deleteComment(
      req.user.id,
      eventId,
      commentId,
    );
  }
}