import { MongoAbility } from '@casl/ability';

export type AppSubjects = 'Place' | 'Event' | 'User' | 'all';

type SubjectObject = Record<string, any>;

export type AppActions =
  | 'manage'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject';

export type AppAbility = MongoAbility<
  [AppActions, AppSubjects | SubjectObject]
>;

export interface AbilityUser {
  id: string;
  role: 'USER' | 'ADMIN';
}