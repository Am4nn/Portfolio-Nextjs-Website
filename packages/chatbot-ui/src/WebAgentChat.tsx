'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { WebAgent, ChatMessage, ActionLogEntry } from '@anthropic-ai/web-agent';
import styles from './WebAgentChat.module.css';

export interface WebAgentChatProps {
  agent: WebAgent;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'dark' | 'light' | 'auto';
  defaultOpen?: boolean;
}

// ─── Tool name → human-readable label ───────────────────────────────────────

const TOOL_LABELS: Record<string, string> = {
  read_dom: 'Reading page content',
  query_element: 'Inspecting element',
  mutate_element: 'Modifying element',
  inject_html: 'Injecting HTML',
  generate_and_inject: 'Generating & injecting widget',
  navigate: 'Navigating',
  click_element: 'Clicking element',
  fill_form: 'Filling form',
  get_storage: 'Reading storage',
  set_storage: 'Writing storage',
  get_page_data: 'Extracting page data',
  apply_theme: 'Applying theme',
  highlight_element: 'Highlighting element',
  scroll_to: 'Scrolling',
  emit_event: 'Dispatching event',
  execute_bridge: 'Calling framework bridge',
};

function getToolLabel(toolName: string): string {
  return TOOL_LABELS[toolName] ?? toolName;
}

// ─── Simple Markdown Renderer ───────────────────────────────────────────────

function renderMarkdown(text: string): string {
  let html = text
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Line breaks
    .replace(/\n/g, '<br>');
  return html;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export const WebAgentChat: React.FC<WebAgentChatProps> = ({
  agent,
  position = 'bottom-right',
  theme = 'dark',
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [activeActions, setActiveActions] = useState<ActionLogEntry[]>([]);
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Canvas wave animation — runs while agent is working
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isStreaming) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();
    window.addEventListener('resize', setSize);

    // Three wave layers — different speed, amplitude, colour, and phase offset
    const LAYERS = [
      { amp: 9,  freq: 0.007, speed: 1.1,  color: '#38bdf8', lineWidth: 2,   alpha: 0.85 },
      { amp: 13, freq: 0.005, speed: 0.65, color: '#818cf8', lineWidth: 2.5, alpha: 0.55 },
      { amp: 7,  freq: 0.009, speed: 1.6,  color: '#c084fc', lineWidth: 1.5, alpha: 0.4  },
    ];

    const drawEdge = (
      dir: 'top' | 'bottom' | 'left' | 'right',
      amp: number, freq: number, phase: number,
      color: string, lineWidth: number, alpha: number,
    ) => {
      const W = window.innerWidth;
      const H = window.innerHeight;

      // Gradient fades to transparent at both ends so corners stay clean
      let grad: CanvasGradient;
      if (dir === 'top' || dir === 'bottom') {
        grad = ctx.createLinearGradient(0, 0, W, 0);
      } else {
        grad = ctx.createLinearGradient(0, 0, 0, H);
      }
      grad.addColorStop(0,    'transparent');
      grad.addColorStop(0.08, color);
      grad.addColorStop(0.92, color);
      grad.addColorStop(1,    'transparent');

      ctx.lineWidth   = lineWidth;
      ctx.lineCap     = 'round';
      ctx.strokeStyle = grad;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = color;
      ctx.shadowBlur  = 12;

      ctx.beginPath();
      if (dir === 'top') {
        for (let x = 0; x <= W; x += 3) {
          const y = 6 + amp * Math.sin(x * freq + phase);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
      } else if (dir === 'bottom') {
        for (let x = 0; x <= W; x += 3) {
          const y = H - 6 + amp * Math.sin(x * freq + phase + Math.PI);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
      } else if (dir === 'left') {
        for (let y = 0; y <= H; y += 3) {
          const x = 6 + amp * Math.sin(y * freq + phase + Math.PI * 0.5);
          y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
      } else {
        for (let y = 0; y <= H; y += 3) {
          const x = W - 6 + amp * Math.sin(y * freq + phase + Math.PI * 1.5);
          y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    };

    const animate = (ts: number) => {
      const t = ts * 0.001; // seconds
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const { amp, freq, speed, color, lineWidth, alpha } of LAYERS) {
        const phase = t * speed;
        for (const dir of ['top', 'bottom', 'left', 'right'] as const) {
          drawEdge(dir, amp, freq, phase, color, lineWidth, alpha);
        }
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', setSize);
      // Delay clear to let the CSS fade-out finish before blanking canvas
      setTimeout(() => {
        const c = canvasRef.current;
        if (c) c.getContext('2d')?.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }, 900);
    };
  }, [isStreaming]);

  const stopStreaming = useCallback(() => {
    abortRef.current = true;
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput('');
    setIsStreaming(true);
    setStreamingText('');
    setActiveActions([]);
    setCurrentTool(null);
    abortRef.current = false;

    // Add user message immediately
    setMessages(prev => [...prev, {
      role: 'user' as const,
      content: userMessage,
      timestamp: Date.now(),
    }]);

    // Stream the response
    let fullText = '';
    const actions: ActionLogEntry[] = [];

    try {
      for await (const chunk of agent.chat(userMessage)) {
        if (abortRef.current) break;

        switch (chunk.type) {
          case 'text':
            fullText += chunk.text ?? '';
            setStreamingText(fullText);
            break;

          case 'tool_start':
            setCurrentTool(chunk.toolName ?? null);
            break;

          case 'tool_result':
            if (chunk.toolResult) {
              const entry: ActionLogEntry = {
                tool: chunk.toolName ?? 'unknown',
                input: {},
                result: chunk.toolResult,
                timestamp: Date.now(),
              };
              actions.push(entry);
              setActiveActions([...actions]);
            }
            setCurrentTool(null);
            break;

          case 'error':
            fullText += `\n\n⚠️ Error: ${chunk.error}`;
            setStreamingText(fullText);
            break;

          case 'done':
            break;
        }
      }
    } catch (err) {
      fullText += `\n\n⚠️ ${err instanceof Error ? err.message : 'Connection failed'}`;
    }

    abortRef.current = false;

    // Add final assistant message
    setMessages(prev => [...prev, {
      role: 'assistant' as const,
      content: fullText,
      actions: actions.length > 0 ? actions : undefined,
      timestamp: Date.now(),
    }]);

    setStreamingText('');
    setIsStreaming(false);
    setCurrentTool(null);
  }, [input, isStreaming, agent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resolvedTheme = useMemo(() => {
    if (theme !== 'auto') return theme;
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }, [theme]);

  const positionClass = styles[position.replace(/-/g, '_') as keyof typeof styles] ?? styles.bottom_right;

  return (
    <>
      {/* Canvas sine-wave border — visible while agent is working */}
      <canvas
        ref={canvasRef}
        className={`${styles.agentCanvas}${isStreaming ? ` ${styles.agentCanvasActive}` : ''}`}
      />

      {/* Floating Bubble */}
      {!isOpen && (
        <button
          className={`${styles.bubble} ${positionClass} ${styles[resolvedTheme]}`}
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Agent"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className={styles.bubblePulse} />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className={`${styles.panel} ${positionClass} ${styles[resolvedTheme]}`}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.headerDot} />
              <span className={styles.headerTitle}>Web Agent</span>
              {isStreaming && <span className={styles.headerStatus}>thinking...</span>}
            </div>
            <button
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Action Log Toggle */}
          {activeActions.length > 0 && (
            <button
              className={styles.actionToggle}
              onClick={() => setShowActions(!showActions)}
            >
              <span className={styles.actionToggleIcon}>{showActions ? '▼' : '▶'}</span>
              <span>{activeActions.length} action{activeActions.length !== 1 ? 's' : ''} performed</span>
            </button>
          )}

          {/* Collapsible Action Log */}
          {showActions && activeActions.length > 0 && (
            <div className={styles.actionLog}>
              {activeActions.map((action, i) => (
                <div key={i} className={`${styles.actionItem} ${action.result.ok ? styles.actionOk : styles.actionFail}`}>
                  <span className={styles.actionDot} />
                  <span>{getToolLabel(action.tool)}</span>
                  <span className={styles.actionStatus}>{action.result.ok ? '✓' : '✗'}</span>
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className={styles.messages}>
            {messages.length === 0 && !isStreaming && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>⚡</div>
                <p>I can control this entire website.</p>
                <p className={styles.emptyHint}>Try: "make the background dark" or "what's on this page"</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
                {msg.role === 'assistant' ? (
                  <div
                    className={styles.messageContent}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  />
                ) : (
                  <div className={styles.messageContent}>{msg.content}</div>
                )}
                {msg.actions && msg.actions.length > 0 && (
                  <div className={styles.messageActions}>
                    {msg.actions.map((a: ActionLogEntry, j: number) => (
                      <span key={j} className={`${styles.actionBadge} ${a.result.ok ? styles.badgeOk : styles.badgeFail}`}>
                        {getToolLabel(a.tool)} {a.result.ok ? '✓' : '✗'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Streaming text */}
            {isStreaming && streamingText && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div
                  className={styles.messageContent}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(streamingText) }}
                />
                <span className={styles.cursor} />
              </div>
            )}

            {/* Current tool execution indicator */}
            {currentTool && (
              <div className={styles.toolIndicator}>
                <span className={styles.toolSpinner} />
                <span>{getToolLabel(currentTool)}...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={styles.inputArea}>
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              placeholder="Tell me what to do..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
            />
            {isStreaming ? (
              <button
                className={styles.stopBtn}
                onClick={stopStreaming}
                aria-label="Stop"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <rect width="12" height="12" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                className={styles.sendBtn}
                onClick={sendMessage}
                disabled={!input.trim()}
                aria-label="Send"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default WebAgentChat;
