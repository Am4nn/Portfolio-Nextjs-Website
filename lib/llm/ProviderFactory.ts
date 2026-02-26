import { AnthropicProvider } from './providers/AnthropicProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { GoogleProvider } from './providers/GoogleProvider';
import { LocalProvider } from './providers/LocalProvider';
import { LLMProvider } from './types';
import { logger } from '../logger';

export function getLLMProvider(): LLMProvider {
  const providerType = process.env.LLM_PROVIDER || 'anthropic';
  logger.debug(`Provider Factory resolving for: ${providerType}`);

  let provider: LLMProvider;

  switch (providerType.toLowerCase()) {
    case 'openai':
      provider = new OpenAIProvider();
      break;
    case 'google':
      provider = new GoogleProvider();
      break;
    case 'local':
      provider = new LocalProvider();
      break;
    case 'anthropic':
      provider = new AnthropicProvider();
      break;
    default:
      throw new Error(`Unknown provider type: ${providerType}, Expected: openai, google, local, or anthropic`);
  }

  logger.info(`Instantiated ${provider.constructor.name}`);
  return provider;
}
