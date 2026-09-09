import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';

import { GroupMessagingController } from './group-messaging.controller.js';
import { GroupMessagingService } from './group-messaging.service.js';
import { GroupChatGateway } from './group-chat.gateway.js';

@Module({
  imports: [
    AuthModule,
  ],

  controllers: [
    GroupMessagingController,
  ],

  providers: [
    GroupMessagingService,
    GroupChatGateway,
  ],
})
export class GroupMessagingModule {}