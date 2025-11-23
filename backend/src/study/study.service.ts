import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudySession } from './study-session.entity';
import { FlashcardReview } from './flashcard-review.entity';
import { CreateStudySessionDto } from './dto/create-study-session.dto';

@Injectable()
export class StudyService {
  constructor(
    @InjectRepository(StudySession)
    private studySessionRepository: Repository<StudySession>,
    @InjectRepository(FlashcardReview)
    private flashcardReviewRepository: Repository<FlashcardReview>,
  ) {}

  async createStudySession(
    userId: string,
    createStudySessionDto: CreateStudySessionDto,
  ): Promise<StudySession> {
    const session = this.studySessionRepository.create({
      userId,
      ...createStudySessionDto,
    });

    return this.studySessionRepository.save(session);
  }

  async createFlashcardReview(
    userId: string,
    vocabularyId: string,
  ): Promise<FlashcardReview> {
    const review = this.flashcardReviewRepository.create({
      userId,
      vocabularyId,
    });

    return this.flashcardReviewRepository.save(review);
  }

  async getProgress(userId: string): Promise<any> {
    // Get total study sessions
    const totalSessions = await this.studySessionRepository.count({
      where: { userId },
    });

    // Get translation stats
    const translationSessions = await this.studySessionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 100,
    });

    const translationStats = translationSessions
      .filter(
        (s) =>
          s.sessionType === 'translation-en-zh' ||
          s.sessionType === 'translation-zh-en',
      )
      .reduce(
        (acc, session) => {
          acc.totalScore += session.score || 0;
          acc.totalAttempts += session.total || 0;
          return acc;
        },
        { totalScore: 0, totalAttempts: 0 },
      );

    // Get flashcard review count
    const totalFlashcardReviews = await this.flashcardReviewRepository.count({
      where: { userId },
    });

    // Get recent activity
    const recentSessions = await this.studySessionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      totalSessions,
      translationScore: translationStats.totalScore,
      translationTotal: translationStats.totalAttempts,
      translationPercentage:
        translationStats.totalAttempts > 0
          ? Math.round(
              (translationStats.totalScore / translationStats.totalAttempts) *
                100,
            )
          : 0,
      totalFlashcardReviews,
      recentSessions,
    };
  }

  async getStats(userId: string): Promise<any> {
    const progress = await this.getProgress(userId);

    // Get session breakdown by type
    const sessionsByType = await this.studySessionRepository
      .createQueryBuilder('session')
      .select('session.sessionType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('session.userId = :userId', { userId })
      .groupBy('session.sessionType')
      .getRawMany();

    return {
      ...progress,
      sessionsByType,
    };
  }
}
