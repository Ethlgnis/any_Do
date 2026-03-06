import { IsString, IsOptional, IsIn } from 'class-validator';

export class AiSummarizeDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsIn(['chat', 'file', 'todos'])
  type?: 'chat' | 'file' | 'todos';
}
