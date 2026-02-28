import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { File, FileDocument } from './schemas/file.schema';

interface AuthUser {
  userId: string;
  role: string;
}

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(File.name) private readonly fileModel: Model<FileDocument>,
  ) {}

  async listForUser(user: AuthUser) {
    const query: any = {};
    if (user.role !== 'admin') {
      query.userId = new Types.ObjectId(user.userId);
    }
    return this.fileModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async createForUser(user: AuthUser, data: Partial<File>) {
    const file = await this.fileModel.create({
      ...data,
      userId: new Types.ObjectId(user.userId),
    });
    return file;
  }

  async deleteForUser(user: AuthUser, id: string) {
    const query: any = { _id: id };
    if (user.role !== 'admin') {
      query.userId = new Types.ObjectId(user.userId);
    }

    const res = await this.fileModel.findOneAndDelete(query).exec();
    if (!res) {
      throw new NotFoundException('File not found');
    }

    return { success: true };
  }
}
