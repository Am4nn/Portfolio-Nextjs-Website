import OpenAI from 'openai';
import { LLMProvider, ChatRequest, ChatEvent } from '../types';
import { logger } from '../../logger';

export class LocalProvider implements LLMProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      baseURL: process.env.LOCAL_API_BASE_URL || 'http://localhost:11434/v1',
      apiKey: process.env.LOCAL_API_KEY || 'lm-studio', // Dummy key required by many local API servers
    });
  }

  async streamChat(request: ChatRequest, emit: (event: ChatEvent) => void): Promise<void> {
    try {
      const messages = this.formatMessages(request.messages as any[]);

      logger.debug(`[LocalProvider] Sending request with ${messages.length} messages`);
      logger.debug(`[LocalProvider] Raw messages payload:`, JSON.stringify(messages, null, 2));

      const stream = await this.client.chat.completions.create({
        model: process.env.LOCAL_MODEL || 'llama-3.1-8b-instruct', // Typical local model
        messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
        tools: (request.tools || []).map((t) => ({
          type: 'function',
          function: {
            name: t.name,
            description: t.description,
            parameters: t.input_schema,
          },
        })),
        stream: true,
      });

      let currentToolCallId: string | null = null;
      let currentToolName = '';
      let currentToolArguments = '';

      for await (const chunk of stream) {
        const choice = chunk.choices[0];
        if (!choice) continue;

        if (choice.delta.content) {
          emit({ type: 'text', text: choice.delta.content });
        }

        if (choice.delta.tool_calls && choice.delta.tool_calls.length > 0) {
          const toolCallDelta = choice.delta.tool_calls[0];

          if (toolCallDelta.id) {
            if (currentToolCallId) {
              this.emitToolCall(currentToolCallId, currentToolName, currentToolArguments, emit);
            }
            currentToolCallId = toolCallDelta.id;
            currentToolName = toolCallDelta.function?.name || '';
            currentToolArguments = toolCallDelta.function?.arguments || '';
          } else {
            if (toolCallDelta.function?.arguments) {
              currentToolArguments += toolCallDelta.function.arguments;
            }
          }
        }

        if (choice.finish_reason) {
          if (currentToolCallId) {
            this.emitToolCall(currentToolCallId, currentToolName, currentToolArguments, emit);
            currentToolCallId = null;
          }

          let stopReason = 'end_turn';
          if (choice.finish_reason === 'tool_calls') stopReason = 'tool_use';

          emit({ type: 'stop', stop_reason: stopReason });
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`[LocalProvider] Error: ${error}`);
      console.error('[LocalProvider]', error);
      emit({ type: 'error', error });
    }
  }

  private emitToolCall(
    id: string,
    name: string,
    argumentsJson: string,
    emit: (event: ChatEvent) => void
  ) {
    let input: Record<string, unknown> = {};
    try {
      input = JSON.parse(argumentsJson || '{}');
    } catch {
      // malformed JSON
    }

    logger.info(`[LocalProvider] Tool Use Emitted: ${name}`);
    logger.debug(`[LocalProvider] Tool Use Payload:`, JSON.stringify({ id, name, input }));

    emit({
      type: 'tool_use',
      id,
      name,
      input,
    });
  }

  /**
   * Translates our agnostic message format into the exact format OpenAI SDK expects.
   */
  private formatMessages(messages: any[]): OpenAI.Chat.ChatCompletionMessageParam[] {
    const formatted: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    for (const msg of messages) {
      if (typeof msg.content === 'string') {
        formatted.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
        continue;
      }

      // Handle array content (blocks)
      if (Array.isArray(msg.content)) {
        if (msg.role === 'assistant') {
          // Assistant messages might contain tool calls
          let textContent = '';
          const toolCalls: any[] = [];

          for (const block of msg.content) {
            if (block.type === 'text') {
              textContent += block.text;
            } else if (block.type === 'tool_use') {
              toolCalls.push({
                id: block.id,
                type: 'function',
                function: {
                  name: block.name,
                  arguments: JSON.stringify(block.input || {}),
                },
              });
            }
          }

          formatted.push({
            role: 'assistant',
            content: textContent || null,
            ...(toolCalls.length > 0 ? { tool_calls: toolCalls } : {}),
          });
        } else if (msg.role === 'user') {
          // User messages might actually be tool results
          let hasToolResult = false;

          for (const block of msg.content) {
            if (block.type === 'tool_result') {
              hasToolResult = true;
              formatted.push({
                role: 'tool',
                tool_call_id: block.tool_use_id,
                content: typeof block.content === 'string' ? block.content : JSON.stringify(block.content),
              });
            }
          }

          if (!hasToolResult) {
            formatted.push({
              role: 'user',
              content: msg.content.map((b: any) => {
                if (b.type === 'text') return { type: 'text', text: b.text };
                return b;
              })
            });
          }
        }
      }
    }

    return formatted;
  }
}
