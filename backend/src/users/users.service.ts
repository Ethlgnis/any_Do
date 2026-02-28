import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  findAll() {
    return this.userModel.find().sort({ createdAt: -1 }).exec();
  }

  findOne(id: string) {
    return this.userModel.findById(id).exec();
  }

  async update(id: string, updates: Partial<User>) {
    const user = await this.userModel
      .findByIdAndUpdate(id, updates, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async remove(id: string) {
    const res = await this.userModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException('User not found');
    }
    return { success: true };
  }
}
