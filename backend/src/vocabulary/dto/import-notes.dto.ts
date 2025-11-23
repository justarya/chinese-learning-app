import { IsString, IsNotEmpty } from 'class-validator';

export class ImportNotesDto {
  @IsString()
  @IsNotEmpty()
  notes: string;
}
