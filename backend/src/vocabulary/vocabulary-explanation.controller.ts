import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WhitelistGuard } from '../auth/guards/whitelist.guard';
import { VocabularyExplanationService } from './vocabulary-explanation.service';

@Controller('api/vocabulary/explanation')
@UseGuards(JwtAuthGuard, WhitelistGuard)
export class VocabularyExplanationController {
  constructor(private explanationService: VocabularyExplanationService) {}

  @Get(':vocabularyId')
  async getExplanation(@Request() req, @Param('vocabularyId') vocabularyId: string) {
    const userId = req.user.id;
    const explanation = await this.explanationService.getOrCreateExplanation(userId, vocabularyId);

    return {
      id: explanation.id,
      explanation: explanation.explanation,
      chatHistory: explanation.chatHistory || [],
      viewCount: explanation.viewCount,
      vocabulary: explanation.vocabulary,
    };
  }

  @Post(':vocabularyId/chat')
  async chatAboutVocabulary(
    @Request() req,
    @Param('vocabularyId') vocabularyId: string,
    @Body('message') message: string,
  ) {
    const userId = req.user.id;
    const result = await this.explanationService.chatAboutVocabulary(
      userId,
      vocabularyId,
      message,
    );

    return {
      aiResponse: result.aiResponse,
      chatHistory: result.explanation.chatHistory,
    };
  }
}
