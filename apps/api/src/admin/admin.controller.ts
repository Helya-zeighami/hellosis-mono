import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AdminService } from './admin.service.js';
import { AdminFindDto } from './dto/admin-find.dto.js';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';

import type { AuthenticationRequest } from '../common/interfaces/authentication-request.interface.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../auth/casl/roles.decorator.js';
import { RolesGuard } from '../auth/casl/roles.guard.js';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('all')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // =========================
  // EVENTS
  // =========================

  @Get('events')
  async listEvents(@Query() query: AdminFindDto) {
    return this.adminService.listEvents(query);
  }

  @Patch('events/:id/approve')
  async approveEvent(
    @Req() req: AuthenticationRequest,
    @Param('id') id: string,
  ) {
    return this.adminService.approveEvent(req.user.id, id);
  }

  @Patch('events/:id/reject')
  async rejectEvent(
    @Req() req: AuthenticationRequest,
    @Param('id') id: string,
  ) {
    return this.adminService.rejectEvent(req.user.id, id);
  }

  // =========================
  // PLACES
  // =========================

  @Get('places')
  async listPlaces(@Query() query: AdminFindDto) {
    return this.adminService.listPlaces(query);
  }

  @Patch('places/:id/approve')
  async approvePlace(
    @Req() req: AuthenticationRequest,
    @Param('id') id: string,
  ) {
    return this.adminService.approvePlace(req.user.id, id);
  }

  @Patch('places/:id/reject')
  async rejectPlace(
    @Req() req: AuthenticationRequest,
    @Param('id') id: string,
  ) {
    return this.adminService.rejectPlace(req.user.id, id);
  }

  // =========================
  // USERS
  // =========================

  @Get('users')
  async listUsers(@Query() query: AdminFindDto) {
    return this.adminService.listUsers(query);
  }

  @Patch('users/:id/role')
  async updateUserRole(
    @Req() req: AuthenticationRequest,
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(req.user.id, id, dto);
  }
}