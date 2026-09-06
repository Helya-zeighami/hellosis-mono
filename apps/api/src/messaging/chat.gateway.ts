
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import {
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { JwtService } from '@nestjs/jwt';

import { Server, Socket } from 'socket.io';

import { MessagingService } from './messaging.service.js';
import { MessagesService } from './messages.service.js';
import { PresenceService } from './presence.service.js';

import { SendMessageDto } from './dto/send-message.dto.js';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly messagingService: MessagingService,
    private readonly messagesService: MessagesService,
    private readonly presenceService: PresenceService,
  ) {}

  // ============================================
  // CONNECTION
  // ============================================

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload =
        await this.jwtService.verifyAsync(token);

      const userId = payload.sub;

      if (!userId) {
        client.disconnect();
        return;
      }

      // Save authenticated user ID
      client.data.userId = userId;

      // Mark user as online
      this.presenceService.setOnline(
        userId,
        client.id,
      );

      console.log(
        `User ${userId} connected with socket ${client.id}`,
      );
    } catch {
      client.disconnect();
    }
  }

  // ============================================
  // DISCONNECT
  // ============================================

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (!userId) {
      return;
    }

    this.presenceService.setOffline(
      userId,
      client.id,
    );

    console.log(
      `User ${userId} disconnected`,
    );
  }

  // ============================================
  // JOIN CONVERSATION
  // ============================================

  @SubscribeMessage('conversation:join')
  async joinConversation(
    @MessageBody()
    data: {
      conversationId: string;
    },

    @ConnectedSocket()
    client: Socket,
  ) {
    const userId = client.data.userId;

    await this.messagingService.verifyConversationMember(
      userId,
      data.conversationId,
    );

    const room =
      `conversation:${data.conversationId}`;

    client.join(room);

    return {
      success: true,
      conversationId: data.conversationId,
    };
  }

  // ============================================
  // SEND MESSAGE
  // ============================================

  @SubscribeMessage('message:send')
  async sendMessage(
    @MessageBody()
    dto: SendMessageDto,

    @ConnectedSocket()
    client: Socket,
  ) {
    const userId = client.data.userId;

    const result =
      await this.messagesService.sendMessage(
        userId,
        dto,
      );

    const room =
      `conversation:${dto.conversationId}`;

    this.server
      .to(room)
      .emit('message:new', result);

    return result;
  }

  // ============================================
  // PRESENCE CHECK
  // ============================================

  @SubscribeMessage('presence:check')
  async checkPresence(
    @MessageBody()
    data: {
      userId: string;
    },

    @ConnectedSocket()
    client: Socket,
  ) {
    const isOnline =
      this.presenceService.isOnline(
        data.userId,
      );

    return {
      userId: data.userId,
      isOnline,
    };
  }

  // ============================================
  // TYPING START
  // ============================================

  @SubscribeMessage('typing:start')
  async startTyping(
    @MessageBody()
    data: {
      conversationId: string;
    },

    @ConnectedSocket()
    client: Socket,
  ) {
    const userId = client.data.userId;

    // Make sure the user actually belongs
    // to this conversation.
    await this.messagingService.verifyConversationMember(
      userId,
      data.conversationId,
    );

    const room =
      `conversation:${data.conversationId}`;

    // Send to everyone in the room
    // EXCEPT the sender.
    client.to(room).emit('typing:start', {
      conversationId: data.conversationId,
      userId,
    });
  }

  // ============================================
  // TYPING STOP
  // ============================================

  @SubscribeMessage('typing:stop')
  async stopTyping(
    @MessageBody()
    data: {
      conversationId: string;
    },

    @ConnectedSocket()
    client: Socket,
  ) {
    const userId = client.data.userId;

    // Verify membership again.
    await this.messagingService.verifyConversationMember(
      userId,
      data.conversationId,
    );

    const room =
      `conversation:${data.conversationId}`;

    // Tell the other users that
    // this user stopped typing.
    client.to(room).emit('typing:stop', {
      conversationId: data.conversationId,
      userId,
    });
  }
}

