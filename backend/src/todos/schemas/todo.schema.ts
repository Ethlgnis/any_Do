import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TodoDocument = Todo & Document;

@Schema({ timestamps: true })
export class Todo {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: String, enum: ['pending', 'in_progress', 'done'], default: 'pending' })
  status: 'pending' | 'in_progress' | 'done';

  @Prop({ type: Date, required: false })
  dueDate?: Date | null;

  @Prop({ type: String, enum: ['low', 'medium', 'high'], default: 'medium' })
  priority: 'low' | 'medium' | 'high';
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
