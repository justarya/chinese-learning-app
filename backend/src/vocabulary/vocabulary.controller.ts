import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { ImportNotesDto } from './dto/import-notes.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/vocabulary')
@UseGuards(JwtAuthGuard)
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Get()
  async findAll(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 100,
  ) {
    return this.vocabularyService.findAll(req.user.id, page, limit);
  }

  @Get('stats')
  async getStats(@Req() req: any) {
    return this.vocabularyService.getStats(req.user.id);
  }

  @Post()
  async create(@Req() req: any, @Body() createVocabularyDto: CreateVocabularyDto) {
    return this.vocabularyService.create(req.user.id, createVocabularyDto);
  }

  @Post('import')
  async import(@Req() req: any, @Body() importNotesDto: ImportNotesDto) {
    return this.vocabularyService.importNotes(req.user.id, importNotesDto.notes);
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    await this.vocabularyService.delete(id, req.user.id);
    return { message: 'Vocabulary deleted successfully' };
  }

  @Patch(':id/study')
  async markAsStudied(@Req() req: any, @Param('id') id: string) {
    return this.vocabularyService.markAsStudied(id, req.user.id);
  }
}
