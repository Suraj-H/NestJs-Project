import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user/user.entity";
import { Repository } from "typeorm";
import { Follow } from "./follow.entity";
import { ProfileType } from "./types/profile.type";
import { ProfileResponseInterface } from "./types/profileResponse.interface";

@Injectable()
export class ProfileService {

  constructor(
    @InjectRepository(User) private readonly profileRepository: Repository<User>,
    @InjectRepository(Follow) private readonly followRepository: Repository<Follow>
  ) { }

  async getProfile(userId: number, profileUsername: string): Promise<ProfileType> {
    const user = await this.profileRepository.findOne({ username: profileUsername });

    if (!user) throw new HttpException('Profile does not exist...', HttpStatus.NOT_FOUND);

    const follow = await this.followRepository.findOne({ followerId: userId, followingId: user.id });

    return { ...user, following: Boolean(follow) };
  }

  async followProfile(userId: number, profileUsername: string) {
    const user = await this.profileRepository.findOne({ username: profileUsername });

    if (!user) throw new HttpException('Profile does not exist...', HttpStatus.NOT_FOUND);

    if (user.id === userId)
    throw new HttpException('Follower & Following both can not be same...', HttpStatus.BAD_REQUEST);

    const follow = await this.followRepository.findOne({ followerId: userId, followingId: user.id });

    if (!follow) {
      const profileToFollow = new Follow();
      profileToFollow.followerId = userId;
      profileToFollow.followingId = user.id;
      await this.followRepository.save(profileToFollow);
    }

    return { ...user, following: true};
  }

  async unfollowProfile(userId: number, profileUsername: string) {
    const user = await this.profileRepository.findOne({ username: profileUsername });

    if (!user) throw new HttpException('Profile does not exist...', HttpStatus.NOT_FOUND);

    if (user.id === userId)
    throw new HttpException('Follower & Following both can not be same...', HttpStatus.BAD_REQUEST);

    await this.followRepository.delete({
      followerId: userId,
      followingId: user.id
    });

    return { ...user, following: false};
  }



  buildProfileResponse(profile: ProfileType): ProfileResponseInterface {
    delete profile.email;
    return { profile };
  }

}