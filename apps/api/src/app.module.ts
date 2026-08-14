import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from './prisma/prisma.service.js';

@Module({
  imports: [ConfigModule.forRoot(),AuthModule],
  controllers: [AppController],
  providers: [AppService,PrismaService],
})
export class AppModule {}
