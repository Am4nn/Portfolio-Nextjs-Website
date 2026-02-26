import { GoogleGenAI, Type, FunctionDeclaration, Content } from '@google/genai';
import { LLMProvider, ChatRequest, ChatEvent } from '../types';
import { logger } from '../../logger';

export class GoogleProvider implements LLMProvider {
  private client: GoogleGenAI;

  constructor() {
    this.client = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GEMINI_API_KEY,
    });
  }

  async streamChat(request: ChatRequest, emit: (event: ChatEvent) => void): Promise<void> {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      emit({ type: 'error', error: 'GOOGLE_GEMINI_API_KEY not configured' });
      return;
    }

    try {
      // Map our agnostic definitions to Gemini FunctionDeclarations
      const tools = request.tools ? [{
        functionDeclarations: request.tools.map((t): FunctionDeclaration => ({
          name: t.name,
          description: t.description,
          // Note: Gemini's OpenAPI Schema might differ slightly from strict JSON schema.
          // In a production app, more robust mapping might be needed here.
          parameters: t.input_schema as any,
        })),
      }] : [];

      const systemInstruction = request.system ? {
        parts: [{ text: request.system }],
      } : undefined;

      // Map our generic role-based messages to Gemini Content objects
      const contents: Content[] = (request.messages || []).map((msg) => {
        // Here we handle the message translation. 
        // This is simplified. True translation depends on how the frontend sends tool results.
        let role = msg.role === 'assistant' ? 'model' : 'user';
        let parts: any[] = [];

        if (typeof msg.content === 'string') {
          parts.push({ text: msg.content });
        } else if (Array.isArray(msg.content)) {
          // Complex content blocks (handling tool calls and results)
          for (const block of msg.content) {
            if (block.type === 'text') {
              parts.push({ text: block.text });
            } else if (block.type === 'tool_use') {
              parts.push({
                functionCall: {
                  name: block.name,
                  args: block.input || {},
                }
              });
            } else if (block.type === 'tool_result') {
              let parsedResult;
              try {
                parsedResult = typeof block.content === 'string' ? JSON.parse(block.content) : block.content;
              } catch {
                parsedResult = { result: block.content };
              }

              parts.push({
                functionResponse: {
                  name: block.tool_use_id, // Gemini expects matching name. Note: this mapping might need refinement based on exact frontend payload
                  response: parsedResult
                }
              });
            }
          }
        }

        return { role, parts };
      });

      const responseStream = await this.client.models.generateContentStream({
        model: process.env.GOOGLE_MODEL || 'gemini-2.5-pro',
        contents,
        config: {
          systemInstruction,
          tools: tools.length > 0 ? tools : undefined,
          maxOutputTokens: request.max_tokens || 8192,
        },
      });

      logger.debug(`[GoogleProvider] Sending request with ${contents.length} messages`);
      logger.debug(`[GoogleProvider] Raw messages payload:`, JSON.stringify(contents, null, 2));

      for await (const chunk of responseStream) {
        if (chunk.text) {
          emit({ type: 'text', text: chunk.text });
        }

        if (chunk.functionCalls && chunk.functionCalls.length > 0) {
          for (const call of chunk.functionCalls) {
            const id = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const name = call.name || 'unknown_tool';
            const input = call.args;

            logger.info(`[GoogleProvider] Tool Use Emitted: ${name}`);
            logger.debug(`[GoogleProvider] Tool Use Payload:`, JSON.stringify({ id, name, input }));

            emit({
              type: 'tool_use',
              id, // Gemini doesn't always provide an ID string like Anthropic/OpenAI
              name,
              input,
            });
          }
        }
      }

      emit({ type: 'stop', stop_reason: 'end_turn' });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`[GoogleProvider] Error: ${error}`);
      console.error('[GoogleProvider]', error);
      emit({ type: 'error', error });
    }
  }
}
