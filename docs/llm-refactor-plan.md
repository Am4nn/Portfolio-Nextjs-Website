# LLM Provider Refactoring Plan

## 1. Goal
Refactor the current hardcoded Anthropic implementation to a dynamic, provider-agnostic architecture using SOLID principles. The frontend should remain "dumb" concerning which LLM is processing the request, and the server-side should handle the routing and translation of message logic via an environment variable.

## 2. Server-side Architecture (SOLID Principles)

We will introduce a `lib/llm` directory on the server containing the core provider logic.

### 2.1 The Common Interface (`lib/llm/types.ts`)
We will define a common interface that all LLM providers must implement.
```typescript
export interface ChatRequest {
  model?: string;
  system?: string;
  messages: Array<any>; // Our agnostic message format
  tools?: Array<any>;   // Our agnostic tool definition format
  max_tokens?: number;
}

export type ChatEvent = 
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: any }
  | { type: 'stop'; stop_reason: string }
  | { type: 'error'; error: string };

export interface LLMProvider {
  /**
   * Initializes the stream and emits normalized events via the emitter function.
   */
  streamChat(request: ChatRequest, emit: (event: ChatEvent) => void): Promise<void>;
}
```

### 2.2 Provider Implementations (`lib/llm/providers/`)
We will create segregated classes for each provider. Each class is responsible for translating the common `ChatRequest` into the provider's specific API format, and transforming the stream responses back into the common `ChatEvent`.

1. **`AnthropicProvider.ts`**: Maps to `@anthropic-ai/sdk`.
2. **`OpenAIProvider.ts`**: Maps to `openai` SDK, translating tool calls (`tool_calls`) to `tool_use`.
3. **`GoogleProvider.ts`**: Maps to `@google/genai` (Gemini), translating function calls (`functionCall`) to `tool_use`.
4. **`LocalProvider.ts`**: Connects to local LLMs (like LLaMA via Ollama or LM Studio) using an OpenAI-compatible interface with a custom base URL.

### 2.3 Provider Factory (`lib/llm/ProviderFactory.ts`)
A factory will read the `LLM_PROVIDER` environment variable and instantiate the correct provider class.
```typescript
export function getLLMProvider(): LLMProvider {
  const providerType = process.env.LLM_PROVIDER || 'anthropic';
  
  switch (providerType.toLowerCase()) {
    case 'openai': return new OpenAIProvider();
    case 'google': return new GoogleProvider();
    case 'local': return new LocalProvider();
    case 'anthropic':
    default: return new AnthropicProvider();
  }
}
```

## 3. Frontend Refactoring (`packages/web-agent`)
The frontend is already decently agnostic in how it processes SSE streams. However, to ensure it doesn't leak Anthropic specifics:
1. Revise types in `packages/web-agent/src/types.ts` to be provider-agnostic.
2. Leave tool definitions as standard JSON Schema (`TOOL_DEFINITIONS`). OpenAI and Google native SDKs also use JSON Schema for function parameters, making the translation on the server straightforward.
3. Remove `anthropic-ai` specific terminology from comments and types if necessary.

## 4. API Route Integration (`app/api/agent/chat/route.ts`)
The API route will simply grab the request, instantiate the provider, and handle the streaming connection.
```typescript
import { getLLMProvider } from '@/lib/llm/ProviderFactory';

export async function POST(request: Request) {
  const body = await request.json();
  const provider = getLLMProvider();

  const readable = new ReadableStream({
    async start(controller) {
      const emit = (event) => {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      
      try {
        await provider.streamChat(body, emit);
      } catch (err) { ... }
      finally { controller.close(); }
    }
  });

  return new Response(readable, { ... });
}
```

## 5. Environment Variables
Update `.env.local` outline in the documentation to include:
```bash
LLM_PROVIDER=anthropic # Options: anthropic, openai, google, local
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
GOOGLE_GEMINI_API_KEY=...
LOCAL_API_BASE_URL=http://localhost:11434/v1 # For Ollama/LM Studio
LOCAL_API_KEY=... # Optional, some local servers require a dummy key like 'lm-studio'
```

## 6. Execution Plan
1. Scaffold `lib/llm` structure and interfaces.
2. Implement `AnthropicProvider`.
3. Hook API route to `ProviderFactory` and verify existing Anthropic chat works.
4. Add `openai` package and implement `OpenAIProvider`.
5. Add `@google/genai` package and implement `GoogleProvider`.
6. Implement `LocalProvider` for local LLMs (LLaMA via Ollama/LM Studio).
7. Refactor package names (e.g., `@anthropic-ai/web-agent` to `@agent/web-agent`) if required by the user to reflect "dumb" approach without Anthropic hardcoding.
