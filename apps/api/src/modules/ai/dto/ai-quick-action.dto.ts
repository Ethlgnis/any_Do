import { IsString, IsOptional, IsObject } from 'class-validator';

export class AiQuickActionDto {
  @IsString()
  action: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}
