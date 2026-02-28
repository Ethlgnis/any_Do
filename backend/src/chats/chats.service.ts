import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage, ChatMessageDocument } from './schemas/chat-message.schema';

interface AuthUser {
  userId: string;
}

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(ChatMessage.name)
    private readonly messageModel: Model<ChatMessageDocument>,
  ) {}

  async listMessages(roomId: string) {
    return this.messageModel
      .find({ roomId })
      .sort({ timestamp: 1 })
      .exec();
  }

  async sendMessage(user: AuthUser, roomId: string, content: string) {
    const msg = await this.messageModel.create({
      roomId,
      senderId: user.userId,
      content,
    });
    return msg;
  }
}
