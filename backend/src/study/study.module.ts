import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudySession } from './study-session.entity';
import { FlashcardReview } from './flashcard-review.entity';
import { TranslationSentence } from './translation-sentence.entity';
import { StudyService } from './study.service';
import { StudyController } from './study.controller';
import { TranslationSentenceService } from './translation-sentence.service';
import { TranslationSentenceController } from './translation-sentence.controller';
import { Vocabulary } from '../vocabulary/vocabulary.entity';
import { OpenRouterModule } from '../openrouter/openrouter.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudySession, FlashcardReview, TranslationSentence, Vocabulary]),
    OpenRouterModule,
  ],
  controllers: [StudyController, TranslationSentenceController],
  providers: [StudyService, TranslationSentenceService],
  exports: [StudyService, TranslationSentenceService],
})
export class StudyModule {}
