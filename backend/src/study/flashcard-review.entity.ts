import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Vocabulary } from '../vocabulary/vocabulary.entity';

@Entity('flashcard_reviews')
@Index(['userId', 'reviewedAt'])
@Index(['vocabularyId', 'reviewedAt'])
export class FlashcardReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'vocabulary_id' })
  vocabularyId: string;

  @CreateDateColumn({ name: 'reviewed_at' })
  reviewedAt: Date;

  @ManyToOne(() => User, (user) => user.flashcardReviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Vocabulary, (vocab) => vocab.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vocabulary_id' })
  vocabulary: Vocabulary;
}
