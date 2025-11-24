import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VocabularyExplanation } from './vocabulary-explanation.entity';
import { Vocabulary } from './vocabulary.entity';
import { OpenRouterService } from '../openrouter/openrouter.service';

@Injectable()
export class VocabularyExplanationService {
  constructor(
    @InjectRepository(VocabularyExplanation)
    private explanationRepository: Repository<VocabularyExplanation>,
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
    private openRouterService: OpenRouterService,
  ) {}

  async getOrCreateExplanation(
    userId: string,
    vocabularyId: string,
  ): Promise<VocabularyExplanation> {
    // Check if explanation already exists
    let explanation = await this.explanationRepository.findOne({
      where: { userId, vocabularyId },
      relations: ['vocabulary'],
    });

    if (explanation) {
      // Increment view count
      explanation.viewCount += 1;
      await this.explanationRepository.save(explanation);
      return explanation;
    }

    // No cached explanation, generate a new one
    const vocabulary = await this.vocabularyRepository.findOne({
      where: { id: vocabularyId, userId },
    });

    if (!vocabulary) {
      throw new Error('Vocabulary not found');
    }

    // Generate explanation using AI
    const aiExplanation = await this.openRouterService.explainVocabulary(
      vocabulary.chinese,
      vocabulary.pinyin,
      vocabulary.english,
      vocabulary.example,
    );

    // Save to database for caching
    explanation = this.explanationRepository.create({
      userId,
      vocabularyId,
      explanation: aiExplanation,
      chatHistory: [],
      viewCount: 1,
    });

    const saved = await this.explanationRepository.save(explanation);

    // Attach vocabulary relation
    saved.vocabulary = vocabulary;

    return saved;
  }

  async chatAboutVocabulary(
    userId: string,
    vocabularyId: string,
    userMessage: string,
  ): Promise<{ aiResponse: string; explanation: VocabularyExplanation }> {
    // Get or create explanation first
    const explanation = await this.getOrCreateExplanation(userId, vocabularyId);

    // Build chat context
    const chatHistory = explanation.chatHistory || [];
    const vocabulary = explanation.vocabulary;

    // System context about the vocabulary
    const systemContext = `You are helping the user understand this Chinese vocabulary:
Chinese: ${vocabulary.chinese}
Pinyin: ${vocabulary.pinyin}
English: ${vocabulary.english}
${vocabulary.example ? `Example: ${vocabulary.example}` : ''}

Previous explanation: ${explanation.explanation}

Answer the user's question about this vocabulary word. Keep responses concise and educational.`;

    // Prepare messages for AI
    const messages = [
      { role: 'system', content: systemContext },
      ...chatHistory.slice(-10), // Last 10 messages for context
      { role: 'user', content: userMessage },
    ];

    // Get AI response
    const aiResponse = await this.openRouterService.chatWithContext(messages);

    // Update chat history
    chatHistory.push({ role: 'user', content: userMessage });
    chatHistory.push({ role: 'assistant', content: aiResponse });
    explanation.chatHistory = chatHistory;

    await this.explanationRepository.save(explanation);

    return { aiResponse, explanation };
  }

  async getExplanation(
    userId: string,
    vocabularyId: string,
  ): Promise<VocabularyExplanation | null> {
    return await this.explanationRepository.findOne({
      where: { userId, vocabularyId },
      relations: ['vocabulary'],
    });
  }
}
