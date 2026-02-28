import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subscription, SubscriptionDocument } from './schemas/subscription.schema';

interface AuthUser {
  userId: string;
  role: string;
}

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async getForCurrentUser(user: AuthUser) {
    return this.subscriptionModel
      .findOne({ userId: new Types.ObjectId(user.userId) })
      .exec();
  }

  async upsertForCurrentUser(user: AuthUser, data: Partial<Subscription>) {
    const res = await this.subscriptionModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(user.userId) },
        { ...data, userId: new Types.ObjectId(user.userId) },
        { upsert: true, new: true },
      )
      .exec();

    return res;
  }

  async listAll(user: AuthUser) {
    if (user.role !== 'admin') {
      return [];
    }
    return this.subscriptionModel.find().sort({ createdAt: -1 }).exec();
  }
}
