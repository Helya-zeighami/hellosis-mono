import { SetMetadata } from '@nestjs/common';

import type { AppSubjects } from './ability.types.js';

export const ROLES_KEY = 'app_roles';

export const Roles = (...subjects: AppSubjects[]) =>
  SetMetadata(ROLES_KEY, subjects);