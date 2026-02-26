import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, ChatRequest, ChatEvent } from '../types';
import { logger } from '../../logger';

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async streamChat(request: ChatRequest, emit: (event: ChatEvent) => void): Promise<void> {
    if (!process.env.ANTHROPIC_API_KEY) {
      emit({ type: 'error', error: 'ANTHROPIC_API_KEY not configured' });
      return;
    }

    try {
      logger.debug(`[AnthropicProvider] Sending request with ${request.messages?.length || 0} messages`);
      logger.debug(`[AnthropicProvider] Raw messages payload:`, JSON.stringify(request.messages, null, 2));

      const stream = this.client.messages.stream({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: request.max_tokens || 8192,
        system: request.system || '',
        messages: (request.messages || []) as Anthropic.MessageParam[],
        tools: (request.tools || []) as Anthropic.Tool[],
      });

      // Track current tool_use block being assembled from partial JSON
      let currentToolBlock: {
        id: string;
        name: string;
        inputJson: string;
      } | null = null;

      for await (const event of stream) {
        if (event.type === 'content_block_start') {
          if (event.content_block.type === 'tool_use') {
            currentToolBlock = {
              id: event.content_block.id,
              name: event.content_block.name,
              inputJson: '',
            };
          }
        } else if (event.type === 'content_block_delta') {
          if (event.delta.type === 'text_delta') {
            emit({ type: 'text', text: event.delta.text });
          } else if (
            event.delta.type === 'input_json_delta' &&
            currentToolBlock
          ) {
            currentToolBlock.inputJson += event.delta.partial_json;
          }
        } else if (event.type === 'content_block_stop') {
          if (currentToolBlock) {
            let input: Record<string, unknown> = {};
            try {
              input = JSON.parse(currentToolBlock.inputJson || '{}');
            } catch {
              // Malformed JSON — emit empty input
            }
            emit({
              type: 'tool_use',
              id: currentToolBlock.id,
              name: currentToolBlock.name,
              input,
            });
            currentToolBlock = null;
          }
        } else if (event.type === 'message_delta') {
          emit({
            type: 'stop',
            stop_reason: event.delta.stop_reason || 'end_turn',
          });
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`[AnthropicProvider] Error: ${error}`);
      console.error('[AnthropicProvider]', error);
      emit({ type: 'error', error });
    }
  }
}
