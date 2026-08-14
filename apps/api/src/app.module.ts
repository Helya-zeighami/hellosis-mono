import { Module } from '@nestjs/common';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ProfileModule } from './profile/profile.module.js';

import { ConfigModule } from '@nestjs/config';
import { InterestModule } from './intereset/interest.module.js';
import { CitiesModule } from './cities/cities.module.js';

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
  ],

  controllers: [
    AppController,
  ],

  providers: [
    AppService,
  ],
})
export class AppModule {}