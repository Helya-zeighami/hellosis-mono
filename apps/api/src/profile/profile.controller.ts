import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js"
import { UpdateProfileDto } from "./dto/update-profile.dto.js"
import { AddInterestDto } from "./dto/add-interest.dto.js"
import { ProfileService } from "./profile.service.js"


interface AuthenticationRequest extends Request{
    user:{
        id:string
    }
}

@Controller('profile')
@UseGuards(JwtAuthGuard)

export class ProfileController{
    constructor(private readonly profileService:ProfileService){}

    @Get()
    async getProfile(@Req() req:AuthenticationRequest){
       return this.profileService.getProfile(req.user.id)
    }

    @Patch()
    async updateProfile(@Req() req:AuthenticationRequest,@Body() body:UpdateProfileDto){
      return this.profileService.updateProfile(req.user.id,body)
    }

    @Post('interests')
    async addInterest(@Req() req:AuthenticationRequest,@Body() body:AddInterestDto){
      return this.profileService.addInterest(req.user.id,body.interestId)
    }

   @Delete('interests/:interestId')
  async removeInterest(
    @Req() req: any,
    @Param('interestId') interestId: string,
  ) {
    return this.profileService.removeInterest(
      req.user.id,
      interestId,
    );
  }
}