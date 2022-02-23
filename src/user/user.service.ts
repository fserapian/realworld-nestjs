import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { UserResponse } from './types/user-response.interface';
import { LoginUserDto } from './dto/login-user.dto';
import { JWT_SECRET } from 'src/config';
import { sign } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) {}

  async login(loginUserDto: LoginUserDto): Promise<User> {
    const user = await this.userRepo.findOne({
      email: loginUserDto.email,
    }, { select: ['id', 'username', 'email', 'bio', 'image', 'password'] });

    if (!user) {
      throw new UnprocessableEntityException('Invalid credentials');
    }

    const isPasswordCorrect = await compare(loginUserDto.password, user.password);
    if (!isPasswordCorrect) {
      throw new UnprocessableEntityException('Invalid credentials');
    }

    delete user.password;
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const userByEmail = await this.userRepo.findOne({
      email: createUserDto.email,
    });

    const userByUsername = await this.userRepo.findOne({
      username: createUserDto.username,
    });

    if (userByEmail || userByUsername) {
      throw new UnprocessableEntityException('Username or email is taken');
    }

    const user = new User();

    Object.assign(user, createUserDto);

    return await this.userRepo.save(user);
  }

  async findById(id: number): Promise<User> {
    return await this.userRepo.findOne(id);
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(userId);
    Object.assign(user, updateUserDto);
    return await this.userRepo.save(user);
  }

  generateJwtToken(user: User): string {
    return sign({
      id: user.id,
      username: user.username,
      email: user.email,
    }, JWT_SECRET);
  }

  buildUserResponse(user: User): UserResponse {
    return {
      user: {
        ...user,
        token: this.generateJwtToken(user),
      },
    };
  }
}
