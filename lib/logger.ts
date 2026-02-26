/**
 * Simple logger utility that only outputs if ENABLE_AGENT_LOGS is 'true'.
 */

const isEnabled = () => process.env.ENABLE_AGENT_LOGS === 'true';

export const logger = {
  info: (message: string, ...optionalParams: unknown[]) => {
    if (isEnabled()) {
      console.log(`ℹ️  [AGENT INFO] ${message}`, ...optionalParams);
    }
  },
  debug: (message: string, ...optionalParams: unknown[]) => {
    if (isEnabled()) {
      console.debug(`🐛 [AGENT DEBUG] ${message}`, ...optionalParams);
    }
  },
  warn: (message: string, ...optionalParams: unknown[]) => {
    if (isEnabled()) {
      console.warn(`⚠️  [AGENT WARN] ${message}`, ...optionalParams);
    }
  },
  error: (message: string, ...optionalParams: unknown[]) => {
    if (isEnabled()) {
      console.error(`❌ [AGENT ERROR] ${message}`, ...optionalParams);
    } else {
      console.error(`❌ [AGENT ERROR] ${message}`);
    }
  },
  chatRequest: (providerType: string, messagesCount: number) => {
    if (isEnabled()) {
      console.log(`\n --------- [NEW REQUEST: ${providerType}] ---------`);
      console.log(`History: ${messagesCount} messages.`);
    }
  },
  agentReply: (text: string) => {
    if (isEnabled() && text.trim()) {
      console.log(`🤖 [AGENT REPLIED]:\n${text.trim()}\n`);
    }
  },
  toolUse: (toolName: string, args: unknown) => {
    if (isEnabled()) {
      console.log(`🛠️  [Executing Tool]: ${toolName}`);
      console.log(`   Payload:`, JSON.stringify(args, null, 2));
    }
  },
  toolResultReceived: (toolId: string, result: unknown) => {
    if (isEnabled()) {
      const resStr = JSON.stringify(result);
      const truncated = resStr.length > 250 ? resStr.slice(0, 250) + '... (truncated)' : resStr;
      console.log(`✅ [Tool Result Incoming]: ${toolId}\n   Data: ${truncated}`);
    }
  }
};
