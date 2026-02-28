import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Todo, TodoDocument } from './schemas/todo.schema';

interface AuthUser {
  userId: string;
  role: string;
}

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name) private readonly todoModel: Model<TodoDocument>,
  ) {}

  async findForUser(user: AuthUser) {
    const query: any = {};
    if (user.role !== 'admin') {
      query.userId = new Types.ObjectId(user.userId);
    }
    return this.todoModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async createForUser(user: AuthUser, data: Partial<Todo>) {
    const todo = await this.todoModel.create({
      ...data,
      userId: new Types.ObjectId(user.userId),
    });
    return todo;
  }

  async updateForUser(user: AuthUser, id: string, updates: Partial<Todo>) {
    const query: any = { _id: id };
    if (user.role !== 'admin') {
      query.userId = new Types.ObjectId(user.userId);
    }

    const todo = await this.todoModel
      .findOneAndUpdate(query, updates, { new: true })
      .exec();

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    return todo;
  }

  async deleteForUser(user: AuthUser, id: string) {
    const query: any = { _id: id };
    if (user.role !== 'admin') {
      query.userId = new Types.ObjectId(user.userId);
    }

    const res = await this.todoModel.findOneAndDelete(query).exec();
    if (!res) {
      throw new NotFoundException('Todo not found');
    }
    return { success: true };
  }
}
