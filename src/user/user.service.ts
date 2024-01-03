import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { Role } from './enum/role.enum';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  async findAll(page: number, size: number) {
    return this.userRepository.find({
      skip: (page - 1) * size,
      take: size,
    });
  }

  async findOne(id: string) {
    return 'find user';
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    return user;
  }

  async checkAdminUser(userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    return user.role === Role.Admin;
  }
}
