import { Injectable } from '@nestjs/common';
import { AgentBuilder } from 'src/lib/chain-builder';
import { Conversation } from '@my-monorepo/shared';
import { CallbackManager } from 'langchain/callbacks';
import { ChatHistoryBuilderService } from 'src/services/chat-history-builder/chat-history-builder.service';
import { AgentLLMBuilder } from 'src/lib/llm-builder/agent-llm-builder';
// import { Calculator } from 'langchain/tools';
import { formatToOpenAITool, SerpAPI } from 'langchain/tools';
import { createAgent } from 'src/lib/chains/agent';
import * as process from 'process';

@Injectable()
export class AgentService extends AgentBuilder {
  constructor(private chatHistoryBuilder: ChatHistoryBuilderService) {
    super();
  }

  fromConversation(
    conversation: Conversation,
    callbackManager: CallbackManager,
  ) {
    if (conversation.bot.type !== 'AGENT') {
      throw new Error('Bot is not an agent');
    }

    const model = new AgentLLMBuilder().build({
      lmConfig: conversation.bot.configuration.lm,
      callbackManager,
      keys: conversation.creator,
    });
    const tools = [new SerpAPI(process.env.SERP_API_KEY)];
    const modelWithTools = model.bind({
      tools: tools.map(formatToOpenAITool),
    });
    return createAgent(modelWithTools, tools);
  }
}