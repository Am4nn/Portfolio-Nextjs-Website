import OpenAI from 'openai';
import { LLMProvider, ChatRequest, ChatEvent } from '../types';
import { logger } from '../../logger';

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async streamChat(request: ChatRequest, emit: (event: ChatEvent) => void): Promise<void> {
    if (!process.env.OPENAI_API_KEY) {
      emit({ type: 'error', error: 'OPENAI_API_KEY not configured' });
      return;
    }

    try {
      const messages = this.formatMessages(request.messages as any[]);

      logger.debug(`[OpenAIProvider] Sending request with ${messages.length} messages`);
      logger.debug(`[OpenAIProvider] Raw messages payload:`, JSON.stringify(messages, null, 2));

      const stream = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
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
            // A new tool call is starting; emit the last one if it existed
            if (currentToolCallId) {
              this.emitToolCall(currentToolCallId, currentToolName, currentToolArguments, emit);
            }

            currentToolCallId = toolCallDelta.id;
            currentToolName = toolCallDelta.function?.name || '';
            currentToolArguments = toolCallDelta.function?.arguments || '';
          } else {
            // Reassembling arguments
            if (toolCallDelta.function?.arguments) {
              currentToolArguments += toolCallDelta.function.arguments;
            }
          }
        }

        if (choice.finish_reason) {
          // Stream ending, emit the final pending tool call if any
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
      logger.error(`[OpenAIProvider] Error: ${error}`);
      console.error('[OpenAIProvider]', error);
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
    logger.info(`[OpenAIProvider] Tool Use Emitted: ${name}`);
    logger.debug(`[OpenAIProvider] Tool Use Payload:`, JSON.stringify({ id, name, input }));
    emit({
      type: 'tool_use',
      id,
      name,
      input,
    });
  }

  /**
   * Translates our agnostic message format (which is heavily Anthropic-inspired)
   * into the exact format OpenAI expects for tool calling.
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

          // If it was just a normal user array message (e.g. image + text)
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
