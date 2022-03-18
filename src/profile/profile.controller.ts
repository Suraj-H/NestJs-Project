import { Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ArticlesResponseInterface } from "src/article/types/articlesResponse.interface";
import { UserDecorator } from "src/user/decorators/user.decorator";
import { AuthGuard } from "src/user/guards/auth.guard";
import { ProfileService } from "./profile.service";
import { ProfileResponseInterface } from "./types/profileResponse.interface";

@Controller('profiles')
export class ProfileController {

  constructor(protected readonly profileService: ProfileService) { }

  @Get('/:username')
  async getProfile(@UserDecorator('id') currentUserId: number, @Param('username') profileUsername: string): Promise<ProfileResponseInterface> {

    const profile = await this.profileService.getProfile(currentUserId, profileUsername);

    return this.profileService.buildProfileResponse(profile);
  }

  @Post('/:username/follow')
  @UseGuards(AuthGuard)
  async followUser(@UserDecorator('id') currentUserId: number, @Param('username') profileUsername: string): Promise<ProfileResponseInterface> {

    const profile = await this.profileService.followProfile(currentUserId, profileUsername);

    return this.profileService.buildProfileResponse(profile);
  }

  
  @Delete('/:username/unfollow')
  @UseGuards(AuthGuard)
  async unfollowUser(@UserDecorator('id') currentUserId: number, @Param('username') profileUsername: string): Promise<ProfileResponseInterface> {

    const profile = await this.profileService.unfollowProfile(currentUserId, profileUsername);

    return this.profileService.buildProfileResponse(profile);
  }

}