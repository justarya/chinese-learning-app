import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Vocabulary } from '../vocabulary/vocabulary.entity';
import { ChatSession } from '../chat/chat-session.entity';
import { StudySession } from '../study/study-session.entity';
import { FlashcardReview } from '../study/flashcard-review.entity';
import { ImportHistory } from '../vocabulary/import-history.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, name: 'google_id' })
  googleId: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true, length: 500 })
  picture: string;

  @Column({ name: 'is_whitelisted', default: false })
  isWhitelisted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Vocabulary, (vocabulary) => vocabulary.user)
  vocabulary: Vocabulary[];

  @OneToMany(() => ChatSession, (session) => session.user)
  chatSessions: ChatSession[];

  @OneToMany(() => StudySession, (session) => session.user)
  studySessions: StudySession[];

  @OneToMany(() => FlashcardReview, (review) => review.user)
  flashcardReviews: FlashcardReview[];

  @OneToMany(() => ImportHistory, (history) => history.user)
  importHistory: ImportHistory[];
}
