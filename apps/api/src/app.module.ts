import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/users/users.module';
import { ChatsModule } from './modules/chats/chats.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { AuthModule } from './modules/auth/auth.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/anydo'),
    UsersModule,
    ChatsModule,
    SubscriptionsModule,
    AuthModule,
    AiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
