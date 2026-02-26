'use client';

import { useEffect, useRef } from 'react';
import { setupBridge, teardownBridge, createStateBridge } from '@anthropic-ai/web-agent';
import type { RegisteredComponent } from '@anthropic-ai/web-agent';

/**
 * Hook that sets up the window.__webAgentBridge for the Next.js app.
 * Call this in your root layout or provider component.
 *
 * The bridge exposes React/app state to the web agent so it can:
 * - Read and write theme state
 * - Read registered component info
 * - Trigger app-level actions (like navigation, theme toggle, etc.)
 */
export function useWebAgentBridge() {
  const stateRef = useRef<Record<string, unknown>>({});
  const listenersRef = useRef<Record<string, Array<(value: unknown) => void>>>({});

  useEffect(() => {
    // Initial state from the page
    stateRef.current = {
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      url: window.location.pathname,
    };

    const components: RegisteredComponent[] = [
      {
        id: 'navbar',
        name: 'Navbar',
        selector: 'nav, [data-component="navbar"]',
        stateKeys: ['theme'],
        actions: ['toggleTheme'],
      },
      {
        id: 'main-content',
        name: 'MainContent',
        selector: 'main, [role="main"]',
        stateKeys: [],
        actions: [],
      },
    ];

    // Find all sections dynamically
    document.querySelectorAll('section[id], [data-section]').forEach(el => {
      const id = el.id || el.getAttribute('data-section') || '';
      if (id) {
        components.push({
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1),
          selector: `#${id}, [data-section="${id}"]`,
          stateKeys: [],
          actions: [],
        });
      }
    });

    const bridge = createStateBridge({
      stateGetter: (key: string) => stateRef.current[key],
      stateSetter: (key: string, value: unknown) => {
        stateRef.current[key] = value;

        // Handle specific state changes
        if (key === 'theme') {
          const htmlEl = document.documentElement;
          if (value === 'dark') {
            htmlEl.classList.add('dark');
            htmlEl.classList.remove('light');
          } else {
            htmlEl.classList.add('light');
            htmlEl.classList.remove('dark');
          }
        }

        // Notify listeners
        listenersRef.current[key]?.forEach(cb => cb(value));
      },
      components,
      actionHandler: (name: string, payload: unknown) => {
        switch (name) {
          case 'toggleTheme': {
            const current = stateRef.current.theme;
            const next = current === 'dark' ? 'light' : 'dark';
            stateRef.current.theme = next;
            document.documentElement.classList.toggle('dark');
            document.documentElement.classList.toggle('light');
            break;
          }
          case 'scrollTo': {
            const target = payload as { selector?: string };
            if (target?.selector) {
              document.querySelector(target.selector)?.scrollIntoView({ behavior: 'smooth' });
            }
            break;
          }
          default:
            console.warn(`[WebAgentBridge] Unknown action: ${name}`);
        }
      },
    });

    setupBridge(bridge);

    return () => {
      teardownBridge();
    };
  }, []);
}
