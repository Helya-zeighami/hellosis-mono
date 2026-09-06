import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const client =
      context.switchToWs().getClient<Socket>();

    const token =
      client.handshake.auth?.token;

    if (!token) {
      throw new UnauthorizedException(
        'Missing authentication token',
      );
    }

    try {
      const payload =
        await this.jwtService.verifyAsync(token);

      client.data.userId = payload.sub;

      return true;
    } catch {
      throw new UnauthorizedException(
        'Invalid authentication token',
      );
    }
  }
}