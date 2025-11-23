import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateFlashcardReviewDto {
  @IsUUID()
  @IsNotEmpty()
  vocabularyId: string;
}
