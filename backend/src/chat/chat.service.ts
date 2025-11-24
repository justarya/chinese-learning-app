import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ChatSession } from './chat-session.entity';
import { ChatMessage } from './chat-message.entity';
import { Vocabulary } from '../vocabulary/vocabulary.entity';
import { OpenRouterService } from '../openrouter/openrouter.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private sessionRepository: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private messageRepository: Repository<ChatMessage>,
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
    private openRouterService: OpenRouterService,
  ) {}

  async createSession(
    userId: string,
    title?: string,
    scenario?: string,
    vocabularyIds?: string[],
  ): Promise<ChatSession> {
    const session = this.sessionRepository.create({
      userId,
      title: title || `${scenario || 'Conversation'}`,
      scenario: scenario || null,
      vocabularyIds: vocabularyIds || [],
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
    scenario?: string,
    vocabularyIds?: string[],
  ): Promise<{ userMessage: ChatMessage; aiMessage: ChatMessage; session: ChatSession }> {
    // Create or get session
    let session: ChatSession;
    if (sessionId) {
      session = await this.findSession(sessionId, userId);
    } else {
      // Auto-generate title from scenario or first message
      const title = scenario || content.substring(0, 50) + (content.length > 50 ? '...' : '');
      session = await this.createSession(userId, title, scenario, vocabularyIds);
    }

    // Check grammar if user message contains Chinese characters
    const hasChinese = /[\u4e00-\u9fa5]/.test(content);
    let grammarResult = null;
    if (hasChinese) {
      try {
        grammarResult = await this.openRouterService.checkGrammar(content);
      } catch (error) {
        // If grammar check fails, continue without it
        console.error('Grammar check failed:', error);
      }
    }

    // Save user message with grammar info
    const userMessage = this.messageRepository.create({
      sessionId: session.id,
      userId,
      role: 'user',
      content,
      hasGrammarError: grammarResult?.hasError || false,
      grammarCorrection: grammarResult?.correction || null,
      grammarTips: grammarResult?.tips || null,
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

    // Get AI response based on context
    let aiResponse: string;
    if (session.scenario && session.vocabularyIds && session.vocabularyIds.length > 0) {
      // Get vocabulary for scenario-based chat
      const vocabulary = await this.vocabularyRepository.find({
        where: {
          id: In(session.vocabularyIds),
        },
      });

      aiResponse = await this.openRouterService.chatWithScenario(
        messages,
        session.scenario,
        vocabulary.map((v) => ({
          chinese: v.chinese,
          pinyin: v.pinyin,
          english: v.english,
        })),
      );
    } else {
      // Regular chat
      aiResponse = await this.openRouterService.chatWithAI(messages);
    }

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

    return { userMessage, aiMessage, session };
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

  async getSessionVocabulary(
    sessionId: string,
    userId: string,
  ): Promise<Vocabulary[]> {
    const session = await this.findSession(sessionId, userId);

    if (!session.vocabularyIds || session.vocabularyIds.length === 0) {
      return [];
    }

    return await this.vocabularyRepository.find({
      where: {
        id: In(session.vocabularyIds),
      },
    });
  }
}
