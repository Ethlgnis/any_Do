import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiChatDto } from './dto/ai-chat.dto';
import { AiSearchDto } from './dto/ai-search.dto';
import { AiSummarizeDto } from './dto/ai-summarize.dto';
import { AiSuggestionsDto } from './dto/ai-suggestions.dto';
import { AiQuickActionDto } from './dto/ai-quick-action.dto';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  chat(@Body() dto: AiChatDto) {
    return this.aiService.chat(dto.message, dto.context ?? {});
  }

  @Post('search')
  search(@Body() dto: AiSearchDto) {
    return this.aiService.search(dto.query, dto.data ?? {});
  }

  @Post('summarize')
  summarize(@Body() dto: AiSummarizeDto) {
    return this.aiService.summarize(dto.content, dto.type ?? 'chat');
  }

  @Post('suggestions')
  suggestions(@Body() dto: AiSuggestionsDto) {
    return this.aiService.suggestions(dto.context ?? {});
  }

  @Post('quick-action')
  quickAction(@Body() dto: AiQuickActionDto) {
    return this.aiService.quickAction(dto.action, dto.data ?? {});
  }
}
