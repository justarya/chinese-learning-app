import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { User } from '../user/user.entity';
import { FlashcardReview } from '../study/flashcard-review.entity';

@Entity('vocabulary')
@Index(['userId', 'createdAt'])
export class Vocabulary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  chinese: string;

  @Column()
  pinyin: string;

  @Column()
  english: string;

  @Column({ type: 'text', nullable: true })
  example: string;

  @Column({ name: 'studied_count', default: 0 })
  studiedCount: number;

  @Column({ name: 'last_studied_at', type: 'timestamp', nullable: true })
  lastStudiedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.vocabulary, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => FlashcardReview, (review) => review.vocabulary)
  reviews: FlashcardReview[];
}
