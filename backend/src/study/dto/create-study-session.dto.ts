import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateStudySessionDto {
  @IsString()
  @IsNotEmpty()
  sessionType: string; // 'flashcard', 'translation-en-zh', 'translation-zh-en'

  @IsNumber()
  @IsOptional()
  score?: number;

  @IsNumber()
  @IsOptional()
  total?: number;

  @IsNumber()
  @IsOptional()
  durationSeconds?: number;
}
