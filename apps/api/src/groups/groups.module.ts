import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { GroupsService } from "./groups.service.js";
import { GroupsController } from "./groups.controller.js";

@Module({
    providers: [GroupsService],
    imports:[PrismaModule],
    controllers: [GroupsController],
})

export class GroupsModule{}