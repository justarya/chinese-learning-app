import { IsString, IsNotEmpty, IsUUID, IsOptional, IsArray } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsOptional()
  sessionId?: string;

  @IsString()
  @IsOptional()
  scenario?: string;

  @IsArray()
  @IsOptional()
  vocabularyIds?: string[];
}
