import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/user/decorators/current-user.decorator';
import { AuthGuard } from 'src/user/guards/auth.guard';

import { ProfileService } from './profile.service';
import { ProfileResponse } from './types/profile-response.interface';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfile(
    @CurrentUser('id') currentUserId: number,
    @Param('username') profileUsername: string
  ): Promise<ProfileResponse> {
    const profile = await this.profileService.getProfile(currentUserId, profileUsername);
    return this.profileService.buildProfileResponse(profile);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followProfile(@CurrentUser('id') currentUserId: number, @Param('username') profileUsername: string): Promise<ProfileResponse> {
    const profile = await this.profileService.followProfile(currentUserId, profileUsername);
    return this.profileService.buildProfileResponse(profile);
  }
}
