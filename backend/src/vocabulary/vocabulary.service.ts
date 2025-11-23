import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vocabulary } from './vocabulary.entity';
import { ImportHistory } from './import-history.entity';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { OpenRouterService } from '../openrouter/openrouter.service';

@Injectable()
export class VocabularyService {
  constructor(
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
    @InjectRepository(ImportHistory)
    private importHistoryRepository: Repository<ImportHistory>,
    private openRouterService: OpenRouterService,
  ) {}

  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 100,
  ): Promise<{ data: Vocabulary[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.vocabularyRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: string, userId: string): Promise<Vocabulary> {
    const vocabulary = await this.vocabularyRepository.findOne({
      where: { id, userId },
    });

    if (!vocabulary) {
      throw new NotFoundException('Vocabulary not found');
    }

    return vocabulary;
  }

  async create(
    userId: string,
    createVocabularyDto: CreateVocabularyDto,
  ): Promise<Vocabulary> {
    const vocabulary = this.vocabularyRepository.create({
      ...createVocabularyDto,
      userId,
    });

    return this.vocabularyRepository.save(vocabulary);
  }

  async createMany(
    userId: string,
    vocabularyList: CreateVocabularyDto[],
  ): Promise<Vocabulary[]> {
    const vocabularies = vocabularyList.map((vocab) =>
      this.vocabularyRepository.create({
        ...vocab,
        userId,
      }),
    );

    return this.vocabularyRepository.save(vocabularies);
  }

  async delete(id: string, userId: string): Promise<void> {
    const vocabulary = await this.findOne(id, userId);
    await this.vocabularyRepository.remove(vocabulary);
  }

  async markAsStudied(id: string, userId: string): Promise<Vocabulary> {
    const vocabulary = await this.findOne(id, userId);

    vocabulary.studiedCount += 1;
    vocabulary.lastStudiedAt = new Date();

    return this.vocabularyRepository.save(vocabulary);
  }

  async importNotes(userId: string, notes: string): Promise<{
    vocabulary: Vocabulary[];
    count: number;
  }> {
    // Use AI to convert notes to structured vocabulary
    const convertedVocab = await this.openRouterService.convertNotesToVocabulary(notes);

    // Save vocabulary
    const savedVocab = await this.createMany(userId, convertedVocab);

    // Save import history
    await this.importHistoryRepository.save({
      userId,
      originalText: notes,
      itemsImported: savedVocab.length,
    });

    return {
      vocabulary: savedVocab,
      count: savedVocab.length,
    };
  }

  async getStats(userId: string): Promise<{
    total: number;
    studied: number;
    lastAdded: Date | null;
  }> {
    const total = await this.vocabularyRepository.count({ where: { userId } });

    const studied = await this.vocabularyRepository.count({
      where: { userId },
      where: { userId, studiedCount: { $gt: 0 } as any },
    });

    const lastVocab = await this.vocabularyRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return {
      total,
      studied,
      lastAdded: lastVocab?.createdAt || null,
    };
  }
}
