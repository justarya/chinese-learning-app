import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Vocabulary } from './vocabulary.entity';

@Entity('vocabulary_explanations')
@Index(['vocabularyId', 'userId'], { unique: true })
export class VocabularyExplanation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vocabulary_id' })
  vocabularyId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'text' })
  explanation: string; // Initial AI-generated explanation

  @Column({ type: 'json', nullable: true, name: 'chat_history' })
  chatHistory: Array<{ role: string; content: string }>; // Follow-up Q&A

  @Column({ name: 'view_count', default: 0 })
  viewCount: number; // Track how many times user viewed this explanation

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Vocabulary, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vocabulary_id' })
  vocabulary: Vocabulary;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
