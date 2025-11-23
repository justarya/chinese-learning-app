import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudySession } from './study-session.entity';
import { FlashcardReview } from './flashcard-review.entity';
import { StudyService } from './study.service';
import { StudyController } from './study.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StudySession, FlashcardReview])],
  controllers: [StudyController],
  providers: [StudyService],
  exports: [StudyService],
})
export class StudyModule {}
