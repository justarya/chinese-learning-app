import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { TranslationSentence } from './translation-sentence.entity';
import { Vocabulary } from '../vocabulary/vocabulary.entity';
import { OpenRouterService } from '../openrouter/openrouter.service';

@Injectable()
export class TranslationSentenceService {
  constructor(
    @InjectRepository(TranslationSentence)
    private sentenceRepository: Repository<TranslationSentence>,
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
    private openRouterService: OpenRouterService,
  ) {}

  async generateSentence(
    userId: string,
    mode: 'en-zh' | 'zh-en',
  ): Promise<TranslationSentence> {
    // First, check if we have an existing sentence in the pool with practice_count < 5
    const existingSentence = await this.sentenceRepository.findOne({
      where: {
        userId,
        mode,
        practiceCount: LessThan(5),
      },
      order: {
        practiceCount: 'ASC', // Get least practiced first
        createdAt: 'ASC',
      },
    });

    if (existingSentence) {
      return existingSentence;
    }

    // No existing sentence available, generate a new one
    return await this.createNewSentence(userId, mode);
  }

  private async createNewSentence(
    userId: string,
    mode: 'en-zh' | 'zh-en',
  ): Promise<TranslationSentence> {
    // Get user's vocabulary - prioritize recent and unstudied
    const vocabulary = await this.vocabularyRepository.find({
      where: { userId },
      order: {
        studiedCount: 'ASC', // Unstudied first
        createdAt: 'DESC', // Recent first
      },
      take: 50, // Get pool of 50 to choose from
    });

    if (vocabulary.length === 0) {
      throw new Error('No vocabulary available to generate sentences');
    }

    // Select 2-5 random vocabulary words
    const numWords = Math.min(
      Math.floor(Math.random() * 4) + 2, // Random between 2-5
      vocabulary.length,
    );
    const selectedVocab = this.selectRandomItems(vocabulary, numWords);

    // Prepare vocabulary context for AI
    const vocabContext = selectedVocab
      .map((v) => `${v.chinese} (${v.pinyin}) - ${v.english}`)
      .join(', ');

    // Call OpenRouter to generate sentence
    const generatedSentence = await this.openRouterService.generateSentence(
      selectedVocab,
      mode,
    );

    // Save the new sentence
    const sentence = this.sentenceRepository.create({
      userId,
      mode,
      englishSentence: generatedSentence.english,
      chineseSentence: generatedSentence.chinese,
      vocabularyUsed: selectedVocab.map((v) => v.id),
      practiceCount: 0,
      correctCount: 0,
      difficulty: generatedSentence.difficulty,
    });

    return await this.sentenceRepository.save(sentence);
  }

  async validateAnswer(
    userId: string,
    sentenceId: string,
    userAnswer: string,
  ): Promise<{ isCorrect: boolean; feedback: string; correctAnswer: string }> {
    const sentence = await this.sentenceRepository.findOne({
      where: { id: sentenceId, userId },
    });

    if (!sentence) {
      throw new Error('Sentence not found');
    }

    const correctAnswer =
      sentence.mode === 'en-zh'
        ? sentence.chineseSentence
        : sentence.englishSentence;
    const questionSentence =
      sentence.mode === 'en-zh'
        ? sentence.englishSentence
        : sentence.chineseSentence;

    // Use AI to validate if the meaning is correct (accepts variations)
    const validation = await this.openRouterService.validateTranslation(
      questionSentence,
      correctAnswer,
      userAnswer,
      sentence.mode,
    );

    // Update practice count and correct count
    sentence.practiceCount += 1;
    if (validation.isCorrect) {
      sentence.correctCount += 1;
    }
    await this.sentenceRepository.save(sentence);

    return {
      isCorrect: validation.isCorrect,
      feedback: validation.feedback,
      correctAnswer,
    };
  }

  async getSentenceWithVocabulary(sentenceId: string, userId: string) {
    const sentence = await this.sentenceRepository.findOne({
      where: { id: sentenceId, userId },
    });

    if (!sentence) {
      throw new Error('Sentence not found');
    }

    // Get the vocabulary words used in this sentence
    const vocabulary = await this.vocabularyRepository.find({
      where: {
        id: In(sentence.vocabularyUsed),
      },
    });

    return {
      ...sentence,
      vocabulary,
    };
  }

  private selectRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}
