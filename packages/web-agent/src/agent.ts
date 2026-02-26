import type {
  WebAgentConfig,
  WebAgent,
  AgentChunk,
  AgentAction,
  ToolExecutionResult,
  ChatMessage,
  ActionLogEntry,
  BrowserContext,
} from './types';
import { getBrowserContext } from './context';
import { buildSystemPrompt } from './system-prompt';
import { TOOL_DEFINITIONS } from './tools/definitions';
import { executeTool } from './tools/executors';

/**
 * Create a web agent instance.
 *
 * The agent sends messages to a server-side proxy endpoint which calls Anthropic.
 * Tool execution happens client-side in the browser.
 * The agentic loop continues until all tool calls are resolved.
 */
export function createWebAgent(config: WebAgentConfig): WebAgent {
  const {
    endpoint,
    systemPrompt: customSystemPrompt,
    tools: toolFilter = 'all',
    bridge,
  } = config;

  let messages: ChatMessage[] = [];
  const actionListeners: Array<(action: AgentAction, result: ToolExecutionResult) => void> = [];

  // Filter tool definitions if specific tools requested
  const activeTools = toolFilter === 'all'
    ? TOOL_DEFINITIONS
    : TOOL_DEFINITIONS.filter(t => (toolFilter as string[]).includes(t.name));

  /**
   * Parse a Server-Sent Events response stream.
   * Yields each parsed JSON data object as it arrives.
   */
  async function* parseSSE(
    response: Response
  ): AsyncGenerator<Record<string, unknown>> {
    if (!response.body) return;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              yield JSON.parse(trimmed.slice(6));
            } catch {
              // Skip malformed JSON lines
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Main chat method — sends message, handles streaming response with tool calls.
   * Returns an async generator yielding AgentChunks.
   */
  async function* chat(userMessage: string): AsyncGenerator<AgentChunk> {
    const context = getBrowserContext();
    const systemPrompt = buildSystemPrompt(context, customSystemPrompt);

    // Build conversation history for the API
    const conversationMessages: Array<{ role: string; content: unknown }> = [];

    // Add recent conversation history (last 10 messages for context)
    const recentMessages = messages.slice(-10);
    for (const msg of recentMessages) {
      conversationMessages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Add the current user message
    conversationMessages.push({ role: 'user', content: userMessage });

    // Track actions for this conversation turn
    const actions: ActionLogEntry[] = [];

    // Start the user message in history
    messages.push({
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    });

    // Agentic loop — keep going until we get a final text response
    let continueLoop = true;

    while (continueLoop) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system: systemPrompt,
            messages: conversationMessages,
            tools: activeTools,
            max_tokens: 8192,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          yield { type: 'error', error: `API error ${response.status}: ${errText}` };
          continueLoop = false;
          break;
        }

        // Reconstruct content blocks for conversation history
        const contentBlocks: Array<{
          type: string;
          text?: string;
          id?: string;
          name?: string;
          input?: Record<string, unknown>;
        }> = [];

        const toolResults: Array<{ type: string; tool_use_id: string; content: string }> = [];
        let assistantText = '';
        let stopReason = 'end_turn';
        let currentTextBlock = '';

        // Consume the real SSE stream
        for await (const event of parseSSE(response)) {
          if (event.type === 'text') {
            const text = event.text as string;
            assistantText += text;
            currentTextBlock += text;
            // Yield the real token chunk — no fake delay
            yield { type: 'text', text };
          }

          if (event.type === 'tool_use') {
            // Flush any accumulated text as a content block
            if (currentTextBlock) {
              contentBlocks.push({ type: 'text', text: currentTextBlock });
              currentTextBlock = '';
            }

            const toolName = event.name as string;
            const toolInput = event.input as Record<string, unknown>;
            const toolId = event.id as string;

            // Register this tool call in content blocks for conversation history
            contentBlocks.push({
              type: 'tool_use',
              id: toolId,
              name: toolName,
              input: toolInput,
            });

            // Notify about tool start
            yield {
              type: 'tool_start',
              toolName: toolName as AgentChunk['toolName'],
              toolInput,
            };

            // Execute the tool client-side
            const result = executeTool(toolName, toolInput, bridge);

            // Record the action
            const actionEntry: ActionLogEntry = {
              tool: toolName,
              input: toolInput,
              result,
              timestamp: Date.now(),
            };
            actions.push(actionEntry);

            // Notify listeners
            for (const listener of actionListeners) {
              listener({ tool: toolName as AgentAction['tool'], input: toolInput }, result);
            }

            // Yield tool result
            yield {
              type: 'tool_result',
              toolResult: result,
              toolName: toolName as AgentChunk['toolName'],
            };

            // Collect tool result for the next API call
            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolId,
              content: JSON.stringify(result.data ?? { error: result.error }),
            });
          }

          if (event.type === 'stop') {
            stopReason = (event.stop_reason as string) ?? 'end_turn';
          }

          if (event.type === 'error') {
            yield { type: 'error', error: event.error as string };
            continueLoop = false;
            break;
          }
        }

        // Flush remaining text block
        if (currentTextBlock) {
          contentBlocks.push({ type: 'text', text: currentTextBlock });
        }

        // If we had tool calls, continue the agentic loop
        if (stopReason === 'tool_use' && toolResults.length > 0) {
          conversationMessages.push({
            role: 'assistant',
            content: contentBlocks,
          });
          conversationMessages.push({
            role: 'user',
            content: toolResults,
          });
          continueLoop = true;
        } else {
          // Final response — we're done
          continueLoop = false;
          messages.push({
            role: 'assistant',
            content: assistantText,
            actions: actions.length > 0 ? actions : undefined,
            timestamp: Date.now(),
          });

          if (stopReason === 'max_tokens' || stopReason === 'length') {
            yield {
              type: 'error',
              error: 'Response was cut off due to reaching the maximum token limit. Please tell me to continue or be more specific.'
            };
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        yield { type: 'error', error: errorMsg };
        continueLoop = false;
      }
    }

    yield { type: 'done' };
  }

  /**
   * Execute a single tool action directly.
   */
  async function execute(action: AgentAction): Promise<ToolExecutionResult> {
    const result = executeTool(action.tool, action.input, bridge);
    for (const listener of actionListeners) {
      listener(action, result);
    }
    return result;
  }

  /**
   * Get current browser context snapshot.
   */
  function getContext(): BrowserContext {
    return getBrowserContext();
  }

  /**
   * Get all conversation messages.
   */
  function getMessages(): ChatMessage[] {
    return [...messages];
  }

  /**
   * Subscribe to action events.
   */
  function on(
    _event: 'action',
    callback: (action: AgentAction, result: ToolExecutionResult) => void
  ): () => void {
    actionListeners.push(callback);
    return () => {
      const idx = actionListeners.indexOf(callback);
      if (idx >= 0) actionListeners.splice(idx, 1);
    };
  }

  /**
   * Cleanup.
   */
  function destroy() {
    messages = [];
    actionListeners.length = 0;
  }

  return { chat, execute, getContext, getMessages, on, destroy };
}
