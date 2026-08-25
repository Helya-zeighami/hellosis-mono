import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { GroupsService } from './groups.service.js';
import type { AuthenticationRequest } from '../common/interfaces/authentication-request.interface.js';
import { FindGroupsDto } from './dto/find-groups.dto.js';
import { UpdateGroupDto } from './dto/update-group.dto.js';
import { CreateGroupDto } from './dto/create-group.dto.js';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  async create(@Req() req: AuthenticationRequest, @Body() dto: CreateGroupDto) {
    return this.groupsService.create(req.user.id, dto);
  }

  // Get groups with filters
  @Get()
  async findAll(@Query() query: FindGroupsDto) {
    return this.groupsService.findAll(query);
  }

  // Get single group
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  // Update group
  @Patch(':id')
  async update(
    @Req() req: AuthenticationRequest,

    @Param('id') id: string,

    @Body() dto: UpdateGroupDto,
  ) {
    return this.groupsService.update(req.user.id, id, dto);
  }

  // Delete group
  @Delete(':id')
  async remove(
    @Req() req: AuthenticationRequest,

    @Param('id') id: string,
  ) {
    return this.groupsService.remove(req.user.id, id);
  }

  // Join group
  @Post(':id/join')
  async join(
    @Req() req: AuthenticationRequest,

    @Param('id') id: string,
  ) {
    return this.groupsService.join(req.user.id, id);
  }

  // Leave group
  @Delete(':id/leave')
  async leave(
    @Req() req: AuthenticationRequest,

    @Param('id') id: string,
  ) {
    return this.groupsService.leave(req.user.id, id);
  }
}
