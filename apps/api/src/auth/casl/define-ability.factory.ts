import {
  AbilityBuilder,
  createMongoAbility,
} from '@casl/ability';

import type {
  AppAbility,
  AbilityUser,
} from './ability.types.js';

export function defineAbilityFor(
  user: AbilityUser,
): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(
    createMongoAbility,
  );

  if (user.role === 'ADMIN') {
    can('manage', 'all');
    can(['approve', 'reject'], ['Place', 'Event']);
    return build();
  }

  // Regular user
  can('read', ['Place', 'Event']);
  can('create', ['Place', 'Event']);
  can(['update', 'delete'], 'Place', {
    createdById: user.id,
  });
  can(['update', 'delete'], 'Event', {
    creatorId: user.id,
  });

  return build();
}