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
    difficulty?: 'beginner' | 'intermediate' | 'advanced',
  ): Promise<TranslationSentence> {
    // First, check if there's a sentence that was answered incorrectly (needs retry)
    const whereCondition: any = {
      userId,
      mode,
      lastAnswerCorrect: false,
    };

    // If difficulty is specified, filter by difficulty too
    if (difficulty) {
      whereCondition.difficulty = difficulty;
    }

    const incorrectSentence = await this.sentenceRepository.findOne({
      where: whereCondition,
      order: {
        updatedAt: 'DESC', // Get most recently attempted first
      },
    });

    if (incorrectSentence) {
      return incorrectSentence;
    }

    // No incorrect sentence, generate a new one
    return await this.createNewSentence(userId, mode, difficulty);
  }

  private async createNewSentence(
    userId: string,
    mode: 'en-zh' | 'zh-en',
    difficulty?: 'beginner' | 'intermediate' | 'advanced',
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

    // Select vocabulary based on difficulty
    let numWords: number;
    if (difficulty === 'beginner') {
      numWords = Math.min(Math.floor(Math.random() * 2) + 2, vocabulary.length); // 2-3 words
    } else if (difficulty === 'intermediate') {
      numWords = Math.min(Math.floor(Math.random() * 2) + 3, vocabulary.length); // 3-4 words
    } else if (difficulty === 'advanced') {
      numWords = Math.min(Math.floor(Math.random() * 2) + 4, vocabulary.length); // 4-5 words
    } else {
      numWords = Math.min(Math.floor(Math.random() * 4) + 2, vocabulary.length); // 2-5 words (default)
    }

    const selectedVocab = this.selectRandomItems(vocabulary, numWords);

    // Prepare vocabulary context for AI
    const vocabContext = selectedVocab
      .map((v) => `${v.chinese} (${v.pinyin}) - ${v.english}`)
      .join(', ');

    // Call OpenRouter to generate sentence with specified difficulty
    const generatedSentence = await this.openRouterService.generateSentence(
      selectedVocab,
      mode,
      difficulty,
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
      lastAnswerCorrect: null, // Not answered yet
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

    // Update practice count, correct count, and last answer correctness
    sentence.practiceCount += 1;
    if (validation.isCorrect) {
      sentence.correctCount += 1;
      sentence.lastAnswerCorrect = true; // Mark as correct so next generation creates new question
    } else {
      sentence.lastAnswerCorrect = false; // Mark as incorrect so next generation returns same question
    }
    await this.sentenceRepository.save(sentence);

    return {
      isCorrect: validation.isCorrect,
      feedback: validation.feedback,
      correctAnswer,
    };
  }

  async skipSentence(
    userId: string,
    sentenceId: string,
  ): Promise<void> {
    const sentence = await this.sentenceRepository.findOne({
      where: { id: sentenceId, userId },
    });

    if (!sentence) {
      throw new Error('Sentence not found');
    }

    // Mark as "skipped" by setting lastAnswerCorrect to true
    // This ensures it won't show up again when generating new sentences
    sentence.lastAnswerCorrect = true;
    await this.sentenceRepository.save(sentence);
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
