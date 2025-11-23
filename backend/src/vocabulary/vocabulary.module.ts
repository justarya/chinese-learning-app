import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vocabulary } from './vocabulary.entity';
import { ImportHistory } from './import-history.entity';
import { VocabularyService } from './vocabulary.service';
import { VocabularyController } from './vocabulary.controller';
import { OpenRouterModule } from '../openrouter/openrouter.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vocabulary, ImportHistory]),
    OpenRouterModule,
  ],
  controllers: [VocabularyController],
  providers: [VocabularyService],
  exports: [VocabularyService],
})
export class VocabularyModule {}
