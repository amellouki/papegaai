import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { BotService } from './bot.service';
import { BotDto, CreateBotDto } from '../../dto/bot-config/0.0.1.dto';
import { SecureRequest } from '../../types/secure-request';

@Controller('bot')
export class BotController {
  constructor(private agentService: BotService) {}
  @Post('create')
  async createBot(
    @Body() body: CreateBotDto,
    @Request() request: SecureRequest,
  ) {
    const creatorId = request.authPayload.uid;
    return this.agentService.createBot(creatorId, body);
  }

  @Post('update')
  async updateBot(@Body() body: BotDto, @Request() request: SecureRequest) {
    const creatorId = request.authPayload.uid;
    const bot = await this.agentService.getBotById(body.id);
    if (bot.creatorId !== creatorId || body.creatorId !== creatorId) {
      throw new UnauthorizedException();
    }
    return this.agentService.updateBot(body);
  }

  @Get('get-bot')
  async getBot(@Query('id') id: string) {
    return await this.agentService.getBotById(Number(id));
  }

  @Get('get-bots')
  async getBots(@Request() request: SecureRequest) {
    return this.agentService.getBotsByCreatorId(request.authPayload.uid);
  }
}
