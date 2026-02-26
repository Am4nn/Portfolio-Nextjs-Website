import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY not configured' },
      { status: 500 }
    );
  }

  let body: {
    model?: string;
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

  const { model, system, messages, tools, max_tokens } = body;

  const encoder = new TextEncoder();
  const emit = (
    controller: ReadableStreamDefaultController,
    data: Record<string, unknown>
  ) => {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  };

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: model || 'claude-sonnet-4-5',
          max_tokens: max_tokens || 8192,
          system: system || '',
          messages: (messages || []) as Anthropic.MessageParam[],
          tools: (tools || []) as Anthropic.Tool[],
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
              emit(controller, { type: 'text', text: event.delta.text });
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
              emit(controller, {
                type: 'tool_use',
                id: currentToolBlock.id,
                name: currentToolBlock.name,
                input,
              });
              currentToolBlock = null;
            }
          } else if (event.type === 'message_delta') {
            emit(controller, {
              type: 'stop',
              stop_reason: event.delta.stop_reason,
              usage: event.usage,
            });
          }
        }
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Unknown error';
        console.error('[Agent API]', error);
        emit(controller, { type: 'error', error });
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
