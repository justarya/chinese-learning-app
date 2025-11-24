import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../user/user.entity';
import { ChatMessage } from './chat-message.entity';

@Entity('chat_sessions')
@Index(['userId', 'createdAt'])
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  scenario: string; // e.g., "at the park", "at a restaurant", "shopping"

  @Column({ type: 'json', nullable: true, name: 'vocabulary_ids' })
  vocabularyIds: string[]; // Selected vocabulary for this conversation

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.chatSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => ChatMessage, (message) => message.session, { cascade: true })
  messages: ChatMessage[];
}
