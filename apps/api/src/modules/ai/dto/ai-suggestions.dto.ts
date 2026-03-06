import { IsOptional, IsObject } from 'class-validator';

export class AiSuggestionsDto {
  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;
}
