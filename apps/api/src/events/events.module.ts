import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { EventsService } from "./events.service.js";
import { EventsController } from "./events.controller.js";


@Module({
    providers: [EventsService],
    controllers: [EventsController],
    imports: [PrismaModule],
})

export class EventsModule{}