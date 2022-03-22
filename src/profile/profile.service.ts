import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/user/user.entity';
import { ProfileType } from './types/profile.type';
import { ProfileResponse } from './types/profile-response.interface';
import { Follow } from './follow.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
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

    const follow = await this.followRepository.findOne({
      followerId: currentUserId,
      followingId: user.id,
    });

    return {
      ...user,
      following: Boolean(follow),
    };
  }

  async followProfile(currentUserId: number, profileUsername: string): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      username: profileUsername,
    });

    if (!user) {
      throw new NotFoundException('Profile not found');
    }

    if (currentUserId === user.id) {
      throw new BadRequestException('User cannot follow himself');
    }

    const follow = await this.followRepository.findOne({
      followerId: currentUserId,
      followingId: user.id,
    });

    if (!follow) {
      const newFollow = new Follow();
      newFollow.followerId = currentUserId;
      newFollow.followingId = user.id;

      await this.followRepository.save(newFollow);
    }

    return { ...user, following: true };
  }

  async unfollowProfile(currentUserId: number, profileUsername: string): Promise<ProfileType> {
    const user = await this.userRepository.findOne({
      username: profileUsername,
    });

    if (!user) {
      throw new NotFoundException('Profile not found');
    }

    if (currentUserId === user.id) {
      throw new BadRequestException('User cannot unfollow himself');
    }

    /* Longer code */
    // const follow = await this.followRepository.findOne({
    //   followerId: currentUserId,
    //   followingId: user.id,
    // });

    // if (follow) {
    //   await this.followRepository.delete(follow);
    // }

    await this.followRepository.delete({
      followerId: currentUserId,
      followingId: user.id,
    });

    return { ...user, following: false };
  }

  buildProfileResponse(profile: ProfileType): ProfileResponse {
    delete profile.email;
    return { profile };
  }
}
