import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/user/user.entity';
import { ProfileType } from './types/profile.type';
import { ProfileResponse } from './types/profile-response.interface';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getProfile(
    currentUserId: number,
    profileUsername: string,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      username: profileUsername,
    });

    if (!user) {
      throw new NotFoundException('Profile not found');
    }

    return {
      ...user,
      following: false,
    };
  }

  buildProfileResponse(profile: ProfileType): ProfileResponse {
    delete profile.email;
    return { profile };
  }
}
