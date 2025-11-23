import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateVocabularyDto {
  @IsString()
  @IsNotEmpty()
  chinese: string;

  @IsString()
  @IsNotEmpty()
  pinyin: string;

  @IsString()
  @IsNotEmpty()
  english: string;

  @IsString()
  @IsOptional()
  example?: string;
}
