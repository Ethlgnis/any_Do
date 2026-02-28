import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubscriptionDocument = Subscription & Document;

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  plan: string;

  @Prop({ type: String, enum: ['active', 'canceled', 'expired'], default: 'active' })
  status: 'active' | 'canceled' | 'expired';

  @Prop({ type: Date, required: false })
  renewalDate?: Date | null;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
