import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { GroupMessagingService } from './group-messaging.service.js';
import { FindGroupMessagesDto } from './dto/find-group-messages.dto.js';

import type { AuthenticationRequest } from '../common/interfaces/authentication-request.interface.js';

@Controller('group-messaging')
@UseGuards(JwtAuthGuard)
export class GroupMessagingController {
  constructor(
    private readonly groupMessagingService: GroupMessagingService,
  ) {}

  // ============================================
  // GROUP MESSAGES
  // ============================================

  @Get('groups/:groupId/messages')
  async findMessages(
    @Req() req: AuthenticationRequest,
    @Param('groupId') groupId: string,
    @Query() dto: FindGroupMessagesDto,
  ) {
    return this.groupMessagingService.findMessages(
      req.user.id,
      groupId,
      dto,
    );
  }
}