import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from './chat-session.entity';
import { ChatMessage } from './chat-message.entity';
import { OpenRouterService } from '../openrouter/openrouter.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private sessionRepository: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private messageRepository: Repository<ChatMessage>,
    private openRouterService: OpenRouterService,
  ) {}

  async createSession(userId: string, title?: string): Promise<ChatSession> {
    const session = this.sessionRepository.create({
      userId,
      title: title || 'New Conversation',
    });

    return this.sessionRepository.save(session);
  }

  async findAllSessions(userId: string): Promise<ChatSession[]> {
    return this.sessionRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
      take: 50, // Limit to 50 most recent sessions
    });
  }

  async findSession(sessionId: string, userId: string): Promise<ChatSession> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId },
      relations: ['messages'],
      order: { messages: { createdAt: 'ASC' } } as any,
    });

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    return session;
  }

  async deleteSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.findSession(sessionId, userId);
    await this.sessionRepository.remove(session);
  }

  async sendMessage(
    userId: string,
    content: string,
    sessionId?: string,
  ): Promise<{ userMessage: ChatMessage; aiMessage: ChatMessage }> {
    // Create or get session
    let session: ChatSession;
    if (sessionId) {
      session = await this.findSession(sessionId, userId);
    } else {
      // Auto-generate title from first message
      const title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
      session = await this.createSession(userId, title);
    }

    // Save user message
    const userMessage = this.messageRepository.create({
      sessionId: session.id,
      userId,
      role: 'user',
      content,
    });
    await this.messageRepository.save(userMessage);

    // Get conversation context (last 10 messages)
    const contextMessages = await this.messageRepository.find({
      where: { sessionId: session.id },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    // Reverse to get chronological order
    const messages = contextMessages.reverse().map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Get AI response
    const aiResponse = await this.openRouterService.chatWithAI(messages);

    // Save AI message
    const aiMessage = this.messageRepository.create({
      sessionId: session.id,
      userId,
      role: 'assistant',
      content: aiResponse,
    });
    await this.messageRepository.save(aiMessage);

    // Update session updated_at
    session.updatedAt = new Date();
    await this.sessionRepository.save(session);

    return { userMessage, aiMessage };
  }

  async getSessionMessages(
    sessionId: string,
    userId: string,
  ): Promise<ChatMessage[]> {
    const session = await this.findSession(sessionId, userId);

    return this.messageRepository.find({
      where: { sessionId: session.id },
      order: { createdAt: 'ASC' },
    });
  }
}
