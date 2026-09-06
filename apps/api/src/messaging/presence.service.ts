
import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
  private onlineUsers = new Map<string, string>();

  setOnline(userId: string, socketId: string) {
    this.onlineUsers.set(userId, socketId);
  }

  setOffline(userId: string, socketId: string) {
    const currentSocketId = this.onlineUsers.get(userId);

  
    if (currentSocketId === socketId) {
      this.onlineUsers.delete(userId);
    }
  }

  isOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  getSocketId(userId: string): string | undefined {
    return this.onlineUsers.get(userId);
  }
}

