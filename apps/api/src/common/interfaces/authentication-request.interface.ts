import { Request } from 'express';

export interface AuthenticationRequest extends Request {
  user: {
    id: string;
    role: 'USER' | 'ADMIN';
  };
}