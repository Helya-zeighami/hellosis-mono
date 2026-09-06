
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';

import { MessagingController } from './messaging.controller.js';

import { MessagingService } from './messaging.service.js';
import { MessagesService } from './messages.service.js';
import { PresenceService } from './presence.service.js';
import { ChatGateway } from './chat.gateway.js';

@Module({
  imports: [
    AuthModule,
  ],

  controllers: [
    MessagingController,
  ],

  providers: [
    MessagingService,
    MessagesService,
    PresenceService,
    ChatGateway,
  ],
})
export class MessagingModule {}
