import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatMessage, ChatMessageSchema } from './schemas/chat-message.schema';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: ChatMessage.name, schema: ChatMessageSchema }])],
  providers: [ChatsService],
  controllers: [ChatsController],
  exports: [MongooseModule],
})
export class ChatsModule {}
