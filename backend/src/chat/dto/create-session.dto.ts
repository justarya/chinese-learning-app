import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  scenario?: string;

  @IsArray()
  @IsOptional()
  vocabularyIds?: string[];
}
