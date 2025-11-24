import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('sessions')
  async getSessions(@Req() req: any) {
    return this.chatService.findAllSessions(req.user.id);
  }

  @Post('sessions')
  async createSession(@Req() req: any, @Body() createSessionDto: CreateSessionDto) {
    return this.chatService.createSession(
      req.user.id,
      createSessionDto.title,
      createSessionDto.scenario,
      createSessionDto.vocabularyIds,
    );
  }

  @Get('sessions/:id')
  async getSession(@Req() req: any, @Param('id') id: string) {
    return this.chatService.findSession(id, req.user.id);
  }

  @Delete('sessions/:id')
  async deleteSession(@Req() req: any, @Param('id') id: string) {
    await this.chatService.deleteSession(id, req.user.id);
    return { message: 'Session deleted successfully' };
  }

  @Post('message')
  async sendMessage(@Req() req: any, @Body() sendMessageDto: SendMessageDto) {
    return this.chatService.sendMessage(
      req.user.id,
      sendMessageDto.content,
      sendMessageDto.sessionId,
      sendMessageDto.scenario,
      sendMessageDto.vocabularyIds,
    );
  }

  @Get('sessions/:id/messages')
  async getMessages(@Req() req: any, @Param('id') id: string) {
    return this.chatService.getSessionMessages(id, req.user.id);
  }

  @Get('sessions/:id/vocabulary')
  async getSessionVocabulary(@Req() req: any, @Param('id') id: string) {
    return this.chatService.getSessionVocabulary(id, req.user.id);
  }
}
