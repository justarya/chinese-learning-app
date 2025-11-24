import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatSession } from './chat-session.entity';
import { ChatMessage } from './chat-message.entity';
import { Vocabulary } from '../vocabulary/vocabulary.entity';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { OpenRouterModule } from '../openrouter/openrouter.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatSession, ChatMessage, Vocabulary]),
    OpenRouterModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
