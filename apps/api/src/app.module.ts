import { Module } from '@nestjs/common';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ProfileModule } from './profile/profile.module.js';

import { ConfigModule } from '@nestjs/config';
import { InterestModule } from './intereset/interest.module.js';
import { CitiesModule } from './cities/cities.module.js';
import { MatchModule } from './match/match.module.js';
import { MessagingModule } from './messaging/messaging.module.js';
import { GroupMessagingModule } from './group-messaging/group-messaging.module.js';
import { GroupsModule } from './groups/groups.module.js';
import { EventsModule } from './events/events.module.js';
import { PlacesModule } from './places/places.module.js';
import { PlaceCategoriesModule } from './place-categories/place-categories.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    AuthModule,
    ProfileModule,
    InterestModule,
    CitiesModule,
    MatchModule,
    MessagingModule,
    GroupMessagingModule,
    GroupsModule,
    EventsModule,
    PlacesModule,
    PlaceCategoriesModule,
  ],

  controllers: [
    AppController,
  ],

  providers: [
    AppService,
  ],
})
export class AppModule {}