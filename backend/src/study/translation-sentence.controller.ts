import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TranslationSentenceService } from './translation-sentence.service';

@Controller('api/study/translation')
@UseGuards(JwtAuthGuard)
export class TranslationSentenceController {
  constructor(private translationSentenceService: TranslationSentenceService) {}

  @Post('generate-sentence')
  async generateSentence(
    @Request() req,
    @Body('mode') mode: 'en-zh' | 'zh-en',
  ) {
    const userId = req.user.id;
    const sentence = await this.translationSentenceService.generateSentence(userId, mode);

    // Get vocabulary details
    const sentenceWithVocab = await this.translationSentenceService.getSentenceWithVocabulary(
      sentence.id,
      userId,
    );

    return {
      id: sentence.id,
      questionSentence: mode === 'en-zh' ? sentence.englishSentence : sentence.chineseSentence,
      englishSentence: sentence.englishSentence,
      chineseSentence: sentence.chineseSentence,
      mode,
      vocabularyUsed: sentenceWithVocab.vocabulary,
      difficulty: sentence.difficulty,
    };
  }

  @Post('validate')
  async validateAnswer(
    @Request() req,
    @Body() body: { sentenceId: string; userAnswer: string },
  ) {
    const userId = req.user.id;
    const result = await this.translationSentenceService.validateAnswer(
      userId,
      body.sentenceId,
      body.userAnswer,
    );

    return result;
  }

  @Post('skip')
  async skipSentence(
    @Request() req,
    @Body() body: { sentenceId: string },
  ) {
    const userId = req.user.id;
    await this.translationSentenceService.skipSentence(userId, body.sentenceId);
    return { success: true };
  }

  @Get('sentence/:id')
  async getSentence(@Request() req, @Param('id') sentenceId: string) {
    const userId = req.user.id;
    return await this.translationSentenceService.getSentenceWithVocabulary(sentenceId, userId);
  }
}
