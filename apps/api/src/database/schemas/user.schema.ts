import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export type UserRole = 'user' | 'admin';

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, sparse: true })
  googleId: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String })
  picture: string;

  @Prop({ type: String })
  driveAccessToken: string;

  @Prop({ type: String })
  driveRefreshToken: string;

  @Prop({ type: String, enum: ['user', 'admin'], default: 'user' })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
