import { getLLMProvider } from '@/lib/llm/ProviderFactory';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  let body: {
    system?: string;
    messages?: unknown[];
    tools?: unknown[];
    max_tokens?: number;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const provider = getLLMProvider();

  logger.chatRequest(provider.constructor.name, body.messages?.length || 0);

  // Check if there are tool results coming in from the last user message
  const lastMsg = body.messages?.[(body.messages?.length || 1) - 1] as any;
  if (lastMsg?.role === 'user' && Array.isArray(lastMsg.content)) {
    lastMsg.content.forEach((block: any) => {
      if (block.type === 'tool_result') {
        logger.toolResultReceived(block.tool_use_id, block.content);
      }
    });
  }

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      let accumulatedText = '';

      const emit = (event: Record<string, unknown>) => {
        if (event.type === 'text' && typeof event.text === 'string') {
          accumulatedText += event.text;
        } else if (event.type === 'tool_use') {
          logger.toolUse(event.name as string, event.input);
        } else if (event.type === 'stop') {
          if (accumulatedText.trim()) {
            logger.agentReply(accumulatedText);
          }
          logger.info(`🏁 Stream finished (reason: ${event.stop_reason})`);
        } else if (event.type === 'error') {
          logger.error(`Stream encountered an error: ${event.error}`);
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        await provider.streamChat(
          {
            system: body.system,
            messages: body.messages || [],
            tools: body.tools || [],
            max_tokens: body.max_tokens,
          },
          emit
        );
      } catch (err) {
        console.error('[Agent API] Raw Error:', err);
        let errorMsg = err instanceof Error ? err.message : 'Unknown error';

        // Try to parse nested Google API error objects (like quotas/rate-limits)
        if (typeof errorMsg === 'string' && errorMsg.includes('{')) {
          try {
            const parsed = JSON.parse(errorMsg.substring(errorMsg.indexOf('{')));
            if (parsed?.error?.message) {
              errorMsg = parsed.error.message;
            } else if (parsed?.error?.code === 429) {
              errorMsg = 'Rate limit or quota exceeded. Please try again later or check your API billing plan.';
            }
          } catch {
            // Ignore parse errors, fallback to original string
          }
        }

        logger.error(`Stream encountered an error: ${errorMsg}`);
        emit({ type: 'error', error: errorMsg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
