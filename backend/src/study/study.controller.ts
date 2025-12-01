import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { StudyService } from './study.service';
import { CreateStudySessionDto } from './dto/create-study-session.dto';
import { CreateFlashcardReviewDto } from './dto/create-flashcard-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WhitelistGuard } from '../auth/guards/whitelist.guard';

@Controller('api/study')
@UseGuards(JwtAuthGuard, WhitelistGuard)
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

  @Get('progress')
  async getProgress(@Req() req: any) {
    return this.studyService.getProgress(req.user.id);
  }

  @Get('stats')
  async getStats(@Req() req: any) {
    return this.studyService.getStats(req.user.id);
  }

  @Post('session')
  async createSession(
    @Req() req: any,
    @Body() createStudySessionDto: CreateStudySessionDto,
  ) {
    return this.studyService.createStudySession(
      req.user.id,
      createStudySessionDto,
    );
  }

  @Post('flashcard')
  async createFlashcardReview(
    @Req() req: any,
    @Body() createFlashcardReviewDto: CreateFlashcardReviewDto,
  ) {
    return this.studyService.createFlashcardReview(
      req.user.id,
      createFlashcardReviewDto.vocabularyId,
    );
  }
}
