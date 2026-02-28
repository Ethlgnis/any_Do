import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatMessageDocument = ChatMessage & Document;

@Schema({ timestamps: { createdAt: 'timestamp', updatedAt: false } })
export class ChatMessage {
  @Prop({ type: String, index: true })
  roomId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  senderId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  isAi?: boolean;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
