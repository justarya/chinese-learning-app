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

@Entity('translation_sentences')
@Index(['userId', 'mode'])
export class TranslationSentence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 20 })
  mode: 'en-zh' | 'zh-en';

  @Column({ type: 'text', name: 'english_sentence' })
  englishSentence: string;

  @Column({ type: 'text', name: 'chinese_sentence' })
  chineseSentence: string;

  @Column({ type: 'json', name: 'vocabulary_used' })
  vocabularyUsed: string[]; // Array of vocabulary IDs used in sentence

  @Column({ name: 'practice_count', default: 0 })
  practiceCount: number; // How many times this sentence has been practiced

  @Column({ name: 'correct_count', default: 0 })
  correctCount: number; // How many times answered correctly

  @Column({ type: 'text', nullable: true })
  difficulty: string; // 'beginner', 'intermediate', 'advanced'

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
