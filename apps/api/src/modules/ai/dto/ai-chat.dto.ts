import { IsString, IsOptional, IsObject } from 'class-validator';

export class AiChatDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;
}
