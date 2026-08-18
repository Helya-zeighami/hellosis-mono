import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { MatchService } from "./match.service.js";
import { MatchController } from "./match.controller.js";

@Module({
    providers: [MatchService],
    imports:[PrismaModule],
    controllers: [MatchController],
})
export class MatchModule{}