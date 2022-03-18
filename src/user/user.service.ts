import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { JWT_SECRET } from "src/config";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/createUser.dto";
import { LoginUserDto } from "./dto/loginUser.dto";
import { UpdateUserDto } from "./dto/updateUser.dto";
import { UserResponseInterface } from "./types/userResponse.interface";
import { User } from "./user.entity";

@Injectable()
export class UserService {

  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) { }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const errorResponse = { errors: {} };

    const userByEmail = await this.userRepository.findOne({ email: createUserDto.email });

    const userByUsername = await this.userRepository.findOne({ username: createUserDto.username });

    if (userByUsername)
      errorResponse.errors['username'] = 'has already been taken';

    if (userByEmail)
      errorResponse.errors['email'] = 'has already been taken';

    if (userByEmail || userByUsername)
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);

    const user = new User();
    Object.assign(user, createUserDto);

    await this.userRepository.save(user);
    delete user.password;

    return user;
  }

  async login(loginUserDto: LoginUserDto): Promise<User> {

    const errorResponse = {
      errors: { 'email or password': 'is invalid' }
    };

    const user = await this.userRepository.findOne({ email: loginUserDto.email }, { select: ['id', 'username', 'email', 'bio', 'image', 'password'] });

    if (!user)
      throw new HttpException(errorResponse , HttpStatus.UNPROCESSABLE_ENTITY);

    const checkedPassword = await compare(loginUserDto.password, user.password); 

    if (!checkedPassword)
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);

    delete user.password;

    return user;
  }

  async findById(id: number): Promise<User> {
    return this.userRepository.findOne(id);
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(userId);
    Object.assign(user, updateUserDto);

    return await this.userRepository.save(user);
  }

  generateJWT(user: User): string {
    return sign({
      id: user.id,
      username: user.username,
      email: user.email
    }, JWT_SECRET);
  }

  buildUserResponse(userEntity: User): UserResponseInterface {
    return {
      user: {
        ...userEntity,
        token: this.generateJWT(userEntity)
      }
    };
  }

}