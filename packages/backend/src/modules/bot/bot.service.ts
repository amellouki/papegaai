import { Injectable } from '@nestjs/common';
import { BotService as AgentRepositoryService } from '../../repositories/bot/bot.service';
import { Prisma } from '@prisma/client';
import { NewBot } from '@my-monorepo/shared';

@Injectable()
export class BotService {
  constructor(private agent: AgentRepositoryService) {}

  createBot(newAgent: NewBot) {
    const botData: Prisma.BotCreateInput = {
      ...newAgent,
      retrievalLanguageModel: {
        create: newAgent.retrievalLanguageModel,
      },
      conversationModel: {
        create: newAgent.conversationModel,
      },
    };
    return this.agent.createBot(botData);
  }

  getRcAgentById(id: number) {
    return this.agent.getBotById(id);
  }

  getAgents() {
    return this.agent.getBots();
  }
}
