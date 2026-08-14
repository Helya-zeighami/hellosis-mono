import { Module } from '@nestjs/common';

import { InterestService } from './interest.service.js';

import { PrismaModule } from '../prisma/prisma.module.js';
import { InterestController } from './intereset.controller.js';

@Module({
  imports: [PrismaModule],

  controllers: [
    InterestController,
  ],

  providers: [
    InterestService,
  ],
})
export class InterestModule {}