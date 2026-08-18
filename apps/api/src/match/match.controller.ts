import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import type { AuthenticationRequest } from "../common/interfaces/authentication-request.interface.js";
import { MatchService } from "./match.service.js";

@Controller()
@UseGuards(JwtAuthGuard)
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get("discover")
  discover(@Req() req: AuthenticationRequest) {
    return this.matchService.recommendations(req.user.id);
  }

  @Get("matches/recommendations")
  recommendations(@Req() req: AuthenticationRequest) {
    return this.matchService.recommendations(req.user.id);
  }

  @Post("matches/:userId")
  sendRequest(
    @Req() req: AuthenticationRequest,
    @Param("userId") userId: string,
  ) {
    return this.matchService.sendRequest(req.user.id, userId);
  }

  @Get("matches/requests")
  requests(@Req() req: AuthenticationRequest) {
    return this.matchService.getRequests(req.user.id);
  }

  @Patch("matches/:id/accept")
  accept(
    @Req() req: AuthenticationRequest,
    @Param("id") id: string,
  ) {
    return this.matchService.acceptMatch(req.user.id, id);
  }

  @Patch("matches/:id/reject")
  reject(
    @Req() req: AuthenticationRequest,
    @Param("id") id: string,
  ) {
    return this.matchService.rejectMatch(req.user.id, id);
  }
}
