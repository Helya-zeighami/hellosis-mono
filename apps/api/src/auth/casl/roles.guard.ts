import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { Request } from 'express';

import { defineAbilityFor } from './define-ability.factory.js';
import { ROLES_KEY } from './roles.decorator.js';
import type {
  AppAbility,
  AppSubjects,
} from './ability.types.js';

export interface AbilityRequest extends Request {
  user: {
    id: string;
    role: 'USER' | 'ADMIN';
  };
  ability: AppAbility;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<
      AppSubjects[] | undefined
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);

    const req = context
      .switchToHttp()
      .getRequest<AbilityRequest>();

    const user = req.user;

    if (!user) {
      throw new ForbiddenException();
    }

    const ability = defineAbilityFor(user);

    (req as AbilityRequest).ability = ability;

    if (!required || required.length === 0) {
      return true;
    }

    const allowed = required.some((subject) =>
      ability.can('manage', subject),
    );

    if (!allowed) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}