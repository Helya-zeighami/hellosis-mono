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

import { UseFilters } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { Server, Socket } from 'socket.io';

import { GroupMessagingService } from './group-messaging.service.js';
import { SendGroupMessageDto } from './dto/send-group-message.dto.js';
import { WsExceptionFilter } from '../common/filters/ws-exception.filter.js';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseFilters(WsExceptionFilter)
export class GroupChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly groupMessagingService: GroupMessagingService,
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
    } catch {
      client.disconnect();
    }
  }

  // ============================================
  // DISCONNECT
  // ============================================

  handleDisconnect(client: Socket) {}

  // ============================================
  // JOIN GROUP CHAT
  // ============================================

  @SubscribeMessage('group:join')
  async joinGroup(
    @MessageBody()
    data: {
      groupId: string;
    },

    @ConnectedSocket()
    client: Socket,
  ) {
    const userId = client.data.userId;

    await this.groupMessagingService.verifyGroupMember(
      userId,
      data.groupId,
    );

    client.join(`group:${data.groupId}`);

    return {
      success: true,
      groupId: data.groupId,
    };
  }

  // ============================================
  // SEND GROUP MESSAGE
  // ============================================

  @SubscribeMessage('group-message:send')
  async sendMessage(
    @MessageBody()
    dto: SendGroupMessageDto,

    @ConnectedSocket()
    client: Socket,
  ) {
    const userId = client.data.userId;

    // The sender is always the authenticated
    // user, never a client-supplied senderId.
    const message =
      await this.groupMessagingService.sendMessage(
        userId,
        dto,
      );

    // Socket.IO room.
    const room = `group:${dto.groupId}`;

    // Broadcast AFTER the database write.
    this.server
      .to(room)
      .emit('group-message:new', message);

    return message;
  }

  // ============================================
  // GROUP TYPING START
  // ============================================

  @SubscribeMessage('group-typing:start')
  async startTyping(
    @MessageBody()
    data: {
      groupId: string;
    },

    @ConnectedSocket()
    client: Socket,
  ) {
    const userId = client.data.userId;

    // Make sure the user actually belongs
    // to this group.
    await this.groupMessagingService.verifyGroupMember(
      userId,
      data.groupId,
    );

    const room = `group:${data.groupId}`;

    // Send to everyone in the room
    // EXCEPT the sender.
    client.to(room).emit('group-typing:start', {
      groupId: data.groupId,
      userId,
    });
  }

  // ============================================
  // GROUP TYPING STOP
  // ============================================

  @SubscribeMessage('group-typing:stop')
  async stopTyping(
    @MessageBody()
    data: {
      groupId: string;
    },

    @ConnectedSocket()
    client: Socket,
  ) {
    const userId = client.data.userId;

    // Verify membership again.
    await this.groupMessagingService.verifyGroupMember(
      userId,
      data.groupId,
    );

    const room = `group:${data.groupId}`;

    // Tell the other users that
    // this user stopped typing.
    client.to(room).emit('group-typing:stop', {
      groupId: data.groupId,
      userId,
    });
  }
}