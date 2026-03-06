import { IsString, IsOptional, IsObject } from 'class-validator';

export class AiSearchDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}
