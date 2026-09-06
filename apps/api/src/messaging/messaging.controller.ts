import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { MessagingService } from './messaging.service.js';
import { MessagesService } from './messages.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { CreateConversationDto } from './dto/create-conversation.dto.js';
import { SendMessageDto } from './dto/send-message.dto.js';
import { FindMessagesDto } from './dto/find-messages.dto.js';

import type { AuthenticationRequest } from '../common/interfaces/authentication-request.interface.js';

@Controller('messaging')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(
    private readonly messagingService: MessagingService,
    private readonly messagesService: MessagesService,
  ) {}

  // ============================================
  // CONVERSATIONS
  // ============================================

  @Post('conversations')
  async createConversation(
    @Req() req: AuthenticationRequest,
    @Body() dto: CreateConversationDto,
  ) {
    return this.messagingService.createConversation(
      req.user.id,
      dto,
    );
  }

  @Get('conversations')
  async findMyConversations(
    @Req() req: AuthenticationRequest,
  ) {
    return this.messagingService.findMyConversations(
      req.user.id,
    );
  }

  @Get('conversations/:conversationId')
  async findOne(
    @Req() req: AuthenticationRequest,
    @Param('conversationId') conversationId: string,
  ) {
    return this.messagingService.findOne(
      req.user.id,
      conversationId,
    );
  }

  // ============================================
  // MESSAGES
  // ============================================

  @Post('messages')
  async sendMessage(
    @Req() req: AuthenticationRequest,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(
      req.user.id,
      dto,
    );
  }

  @Get('conversations/:conversationId/messages')
  async findMessages(
    @Req() req: AuthenticationRequest,
    @Param('conversationId') conversationId: string,
    @Query() dto: FindMessagesDto,
  ) {
    return this.messagesService.findMessages(
      req.user.id,
      conversationId,
      dto,
    );
  }
}