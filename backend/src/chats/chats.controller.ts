import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get(':roomId/messages')
  getMessages(@Param('roomId') roomId: string) {
    return this.chatsService.listMessages(roomId);
  }

  @Post(':roomId/messages')
  sendMessage(
    @Req() req: any,
    @Param('roomId') roomId: string,
    @Body('content') content: string,
  ) {
    return this.chatsService.sendMessage(req.user, roomId, content);
  }
}
