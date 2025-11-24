import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vocabulary } from './vocabulary.entity';
import { ImportHistory } from './import-history.entity';
import { VocabularyExplanation } from './vocabulary-explanation.entity';
import { VocabularyService } from './vocabulary.service';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyExplanationService } from './vocabulary-explanation.service';
import { VocabularyExplanationController } from './vocabulary-explanation.controller';
import { OpenRouterModule } from '../openrouter/openrouter.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vocabulary, ImportHistory, VocabularyExplanation]),
    OpenRouterModule,
  ],
  controllers: [VocabularyController, VocabularyExplanationController],
  providers: [VocabularyService, VocabularyExplanationService],
  exports: [VocabularyService, VocabularyExplanationService],
})
export class VocabularyModule {}
