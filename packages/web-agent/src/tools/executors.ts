import type { ToolExecutionResult, WebAgentBridge } from '../types';
import { getBrowserContext, getUniqueSelector, getPageData } from '../context';

type ToolInput = Record<string, unknown>;

/**
 * Execute a tool by name with the given input.
 */
export function executeTool(
  name: string,
  input: ToolInput,
  bridge?: WebAgentBridge
): ToolExecutionResult {
  try {
    switch (name) {
      case 'read_dom':
        return execReadDom(input);
      case 'query_element':
        return execQueryElement(input);
      case 'mutate_element':
        return execMutateElement(input);
      case 'inject_html':
        return execInjectHtml(input);
      case 'generate_and_inject':
        return execGenerateAndInject(input);
      case 'navigate':
        return execNavigate(input);
      case 'click_element':
        return execClickElement(input);
      case 'fill_form':
        return execFillForm(input);
      case 'get_storage':
        return execGetStorage(input);
      case 'set_storage':
        return execSetStorage(input);
      case 'get_page_data':
        return execGetPageData(input);
      case 'apply_theme':
        return execApplyTheme(input);
      case 'highlight_element':
        return execHighlightElement(input);
      case 'scroll_to':
        return execScrollTo(input);
      case 'emit_event':
        return execEmitEvent(input);
      case 'execute_bridge':
        return execBridge(input, bridge);
      default:
        return { ok: false, tool: name, error: `Unknown tool: ${name}` };
    }
  } catch (err) {
    return {
      ok: false,
      tool: name,
      error: err instanceof Error ? err.message : 'Tool execution failed',
    };
  }
}

// ─── read_dom ───────────────────────────────────────────────────────────────

function execReadDom(input: ToolInput): ToolExecutionResult {
  const selector = input.selector as string | undefined;
  const maxDepth = (input.max_depth as number) ?? 5;
  const root = selector ? document.querySelector(selector) : document.body;

  if (!root) {
    return { ok: false, tool: 'read_dom', error: `Element not found: ${selector}` };
  }

  const snapshot = domToText(root, 0, maxDepth);
  return { ok: true, tool: 'read_dom', data: snapshot };
}

function domToText(el: Element, depth: number, maxDepth: number): string {
  if (depth > maxDepth) return '';
  const tag = el.tagName.toLowerCase();
  const skip = new Set(['script', 'style', 'noscript', 'svg', 'path']);
  if (skip.has(tag)) return '';

  const indent = '  '.repeat(depth);
  const parts: string[] = [];
  const attrs: string[] = [];

  if (el.id) attrs.push(`id="${el.id}"`);
  const cls = el.className && typeof el.className === 'string' ? el.className.trim() : '';
  if (cls) attrs.push(`class="${cls.split(/\s+/).slice(0, 4).join(' ')}"`);
  if (el.getAttribute('aria-label')) attrs.push(`aria-label="${el.getAttribute('aria-label')}"`);
  if (el.getAttribute('href')) attrs.push(`href="${el.getAttribute('href')}"`);
  if (el.getAttribute('role')) attrs.push(`role="${el.getAttribute('role')}"`);

  const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
  parts.push(`${indent}<${tag}${attrStr}>`);

  // Direct text
  const text = Array.from(el.childNodes)
    .filter(n => n.nodeType === Node.TEXT_NODE)
    .map(n => n.textContent?.trim())
    .filter(Boolean)
    .join(' ');
  if (text) {
    const t = text.length > 150 ? text.slice(0, 150) + '...' : text;
    parts.push(`${indent}  "${t}"`);
  }

  for (const child of Array.from(el.children)) {
    const sub = domToText(child, depth + 1, maxDepth);
    if (sub) parts.push(sub);
  }

  return parts.join('\n');
}

// ─── query_element ──────────────────────────────────────────────────────────

function execQueryElement(input: ToolInput): ToolExecutionResult {
  const selector = input.selector as string;
  const el = document.querySelector(selector);
  if (!el || !(el instanceof HTMLElement)) {
    return { ok: false, tool: 'query_element', error: `Element not found: ${selector}` };
  }

  const rect = el.getBoundingClientRect();
  const computed = window.getComputedStyle(el);

  return {
    ok: true,
    tool: 'query_element',
    data: {
      tagName: el.tagName.toLowerCase(),
      text: el.textContent?.trim().slice(0, 500) ?? '',
      innerHTML: el.innerHTML.slice(0, 1000),
      attributes: Object.fromEntries(Array.from(el.attributes).map(a => [a.name, a.value])),
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      styles: {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        fontSize: computed.fontSize,
        display: computed.display,
        position: computed.position,
      },
      visible: el.offsetParent !== null,
      selector: getUniqueSelector(el),
    },
  };
}

// ─── mutate_element ─────────────────────────────────────────────────────────

function execMutateElement(input: ToolInput): ToolExecutionResult {
  const selector = input.selector as string;
  const el = document.querySelector(selector);
  if (!el || !(el instanceof HTMLElement)) {
    return { ok: false, tool: 'mutate_element', error: `Element not found: ${selector}` };
  }

  const changes: string[] = [];

  if (typeof input.text === 'string') {
    el.textContent = input.text;
    changes.push('text');
  }

  if (typeof input.html === 'string') {
    el.innerHTML = input.html;
    changes.push('html');
  }

  if (Array.isArray(input.add_classes)) {
    (input.add_classes as string[]).forEach(c => el.classList.add(c));
    changes.push('add_classes');
  }

  if (Array.isArray(input.remove_classes)) {
    (input.remove_classes as string[]).forEach(c => el.classList.remove(c));
    changes.push('remove_classes');
  }

  if (input.styles && typeof input.styles === 'object') {
    const styles = input.styles as Record<string, string>;
    Object.entries(styles).forEach(([prop, value]) => {
      el.style.setProperty(prop, value);
    });
    changes.push('styles');
  }

  if (input.attributes && typeof input.attributes === 'object') {
    const attrs = input.attributes as Record<string, string>;
    Object.entries(attrs).forEach(([attr, value]) => {
      el.setAttribute(attr, value);
    });
    changes.push('attributes');
  }

  if (typeof input.visible === 'boolean') {
    el.style.display = input.visible ? '' : 'none';
    changes.push('visibility');
  }

  return { ok: true, tool: 'mutate_element', data: { selector, changes } };
}

// ─── inject_html ────────────────────────────────────────────────────────────

function execInjectHtml(input: ToolInput): ToolExecutionResult {
  const selector = input.selector as string;
  const html = input.html as string;
  const position = (input.position as string) ?? 'beforeend';

  const target = document.querySelector(selector);
  if (!target) {
    return { ok: false, tool: 'inject_html', error: `Element not found: ${selector}` };
  }

  if (position === 'replace') {
    target.innerHTML = html;
  } else {
    target.insertAdjacentHTML(position as InsertPosition, html);
  }

  return { ok: true, tool: 'inject_html', data: { selector, position } };
}

// ─── generate_and_inject ────────────────────────────────────────────────────

function execGenerateAndInject(input: ToolInput): ToolExecutionResult {
  const html = input.html as string;
  const description = input.description as string;
  let targetSelector = input.target_selector as string | undefined;
  const position = (input.position as string) ?? 'afterbegin';

  // If no target specified, find the best location
  if (!targetSelector) {
    targetSelector = findBestInjectionTarget();
  }

  const target = document.querySelector(targetSelector);
  if (!target) {
    return { ok: false, tool: 'generate_and_inject', error: `Injection target not found: ${targetSelector}` };
  }

  // Wrap in a container to isolate styles
  const wrapperId = `web-agent-widget-${Date.now()}`;
  const wrapper = `<div id="${wrapperId}" class="web-agent-injected" style="position:relative;z-index:1000;" data-agent-generated="true" data-description="${description.slice(0, 100)}">${html}</div>`;

  if (position === 'replace') {
    target.innerHTML = wrapper;
  } else {
    target.insertAdjacentHTML(position as InsertPosition, wrapper);
  }

  // Execute any scripts in the injected HTML
  const container = document.getElementById(wrapperId);
  if (container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      if (oldScript.src) {
        newScript.src = oldScript.src;
      } else {
        newScript.textContent = oldScript.textContent;
      }
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }

  return { ok: true, tool: 'generate_and_inject', data: { targetSelector, position, wrapperId, description } };
}

/**
 * Find the most appropriate DOM location for injecting a widget.
 * Prefers: main content area > first visible section > body.
 */
function findBestInjectionTarget(): string {
  const candidates = [
    'main',
    '[role="main"]',
    '#main-content',
    '.main-content',
    '#content',
    '.content',
    'article',
    'section:first-of-type',
    'body',
  ];

  for (const sel of candidates) {
    const el = document.querySelector(sel);
    if (el && el instanceof HTMLElement && el.offsetParent !== null) {
      return getUniqueSelector(el);
    }
  }

  return 'body';
}

// ─── navigate ───────────────────────────────────────────────────────────────

function execNavigate(input: ToolInput): ToolExecutionResult {
  const url = input.url as string;

  // Check if it's a relative path (likely Next.js route)
  if (url.startsWith('/') || url.startsWith('#')) {
    window.location.href = url;
  } else if (url.startsWith('http')) {
    window.location.href = url;
  } else {
    window.location.href = '/' + url;
  }

  return { ok: true, tool: 'navigate', data: { url } };
}

// ─── click_element ──────────────────────────────────────────────────────────

function execClickElement(input: ToolInput): ToolExecutionResult {
  const selector = input.selector as string;
  const el = document.querySelector(selector);
  if (!el || !(el instanceof HTMLElement)) {
    return { ok: false, tool: 'click_element', error: `Element not found: ${selector}` };
  }

  el.click();
  return { ok: true, tool: 'click_element', data: { selector, tagName: el.tagName.toLowerCase() } };
}

// ─── fill_form ──────────────────────────────────────────────────────────────

function execFillForm(input: ToolInput): ToolExecutionResult {
  const fields = input.fields as Array<{ selector: string; value: string }>;
  const submit = input.submit as boolean ?? false;
  const filled: string[] = [];
  const errors: string[] = [];

  for (const field of fields) {
    const el = document.querySelector(field.selector);
    if (!el) {
      errors.push(`Not found: ${field.selector}`);
      continue;
    }

    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      // Trigger React-compatible value change
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
        'value'
      )?.set;

      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(el, field.value);
      } else {
        el.value = field.value;
      }

      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      filled.push(field.selector);
    } else if (el instanceof HTMLSelectElement) {
      el.value = field.value;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      filled.push(field.selector);
    }
  }

  // Submit if requested
  if (submit && filled.length > 0) {
    const firstField = document.querySelector(fields[0].selector);
    const form = firstField?.closest('form');
    if (form) {
      form.requestSubmit();
    }
  }

  return {
    ok: errors.length === 0,
    tool: 'fill_form',
    data: { filled, errors: errors.length > 0 ? errors : undefined },
    error: errors.length > 0 ? errors.join('; ') : undefined,
  };
}

// ─── get_storage ────────────────────────────────────────────────────────────

function execGetStorage(input: ToolInput): ToolExecutionResult {
  const storageType = (input.type as string) ?? 'local';
  const key = input.key as string | undefined;
  const storage = storageType === 'session' ? sessionStorage : localStorage;

  if (key) {
    const value = storage.getItem(key);
    return { ok: true, tool: 'get_storage', data: { key, value } };
  }

  // Return all entries
  const entries: Record<string, string | null> = {};
  for (let i = 0; i < storage.length; i++) {
    const k = storage.key(i);
    if (k) entries[k] = storage.getItem(k);
  }

  return { ok: true, tool: 'get_storage', data: entries };
}

// ─── set_storage ────────────────────────────────────────────────────────────

function execSetStorage(input: ToolInput): ToolExecutionResult {
  const storageType = input.type as string;
  const key = input.key as string;
  const value = input.value as string;
  const storage = storageType === 'session' ? sessionStorage : localStorage;

  storage.setItem(key, value);
  return { ok: true, tool: 'set_storage', data: { type: storageType, key } };
}

// ─── get_page_data ──────────────────────────────────────────────────────────

function execGetPageData(input: ToolInput): ToolExecutionResult {
  const data = getPageData();
  const include = input.include as string[] | undefined;

  if (include && include.length > 0) {
    const filtered: Record<string, unknown> = {};
    for (const key of include) {
      if (key in data) filtered[key] = data[key];
    }
    return { ok: true, tool: 'get_page_data', data: filtered };
  }

  return { ok: true, tool: 'get_page_data', data };
}

// ─── apply_theme ────────────────────────────────────────────────────────────

function execApplyTheme(input: ToolInput): ToolExecutionResult {
  const changes: string[] = [];

  if (input.css_variables && typeof input.css_variables === 'object') {
    const vars = input.css_variables as Record<string, string>;
    Object.entries(vars).forEach(([prop, value]) => {
      document.documentElement.style.setProperty(prop, value);
    });
    changes.push('css_variables');
  }

  if (Array.isArray(input.body_classes_add)) {
    (input.body_classes_add as string[]).forEach(c => {
      document.body.classList.add(c);
      document.documentElement.classList.add(c);
    });
    changes.push('body_classes_add');
  }

  if (Array.isArray(input.body_classes_remove)) {
    (input.body_classes_remove as string[]).forEach(c => {
      document.body.classList.remove(c);
      document.documentElement.classList.remove(c);
    });
    changes.push('body_classes_remove');
  }

  if (input.body_styles && typeof input.body_styles === 'object') {
    const styles = input.body_styles as Record<string, string>;
    Object.entries(styles).forEach(([prop, value]) => {
      document.body.style.setProperty(prop, value);
    });
    changes.push('body_styles');
  }

  return { ok: true, tool: 'apply_theme', data: { changes } };
}

// ─── highlight_element ──────────────────────────────────────────────────────

function execHighlightElement(input: ToolInput): ToolExecutionResult {
  const selector = input.selector as string;
  const color = (input.color as string) || 'rgba(59, 130, 246, 0.3)';
  const duration = (input.duration as number) || 3000;

  const el = document.querySelector(selector);
  if (!el || !(el instanceof HTMLElement)) {
    return { ok: false, tool: 'highlight_element', error: `Element not found: ${selector}` };
  }

  const rect = el.getBoundingClientRect();
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: ${rect.top}px;
    left: ${rect.left}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    background: ${color};
    border: 2px solid rgba(59, 130, 246, 0.8);
    border-radius: 4px;
    pointer-events: none;
    z-index: 99999;
    transition: opacity 0.3s ease;
  `;
  overlay.dataset.agentHighlight = 'true';
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 300);
  }, duration);

  return { ok: true, tool: 'highlight_element', data: { selector, duration } };
}

// ─── scroll_to ──────────────────────────────────────────────────────────────

function execScrollTo(input: ToolInput): ToolExecutionResult {
  const selector = input.selector as string | undefined;
  const behavior = (input.behavior as ScrollBehavior) || 'smooth';

  if (selector) {
    const el = document.querySelector(selector);
    if (!el) {
      return { ok: false, tool: 'scroll_to', error: `Element not found: ${selector}` };
    }
    el.scrollIntoView({ behavior, block: 'center' });
    return { ok: true, tool: 'scroll_to', data: { selector } };
  }

  const pos = input.position as { x?: number; y?: number } | undefined;
  if (pos) {
    window.scrollTo({ left: pos.x ?? 0, top: pos.y ?? 0, behavior });
    return { ok: true, tool: 'scroll_to', data: { position: pos } };
  }

  return { ok: false, tool: 'scroll_to', error: 'Provide either selector or position' };
}

// ─── emit_event ─────────────────────────────────────────────────────────────

function execEmitEvent(input: ToolInput): ToolExecutionResult {
  const eventName = input.event_name as string;
  const detail = input.detail as Record<string, unknown> | undefined;
  const selector = input.selector as string | undefined;

  const target = selector ? document.querySelector(selector) : document;
  if (!target) {
    return { ok: false, tool: 'emit_event', error: `Element not found: ${selector}` };
  }

  const event = new CustomEvent(eventName, { detail, bubbles: true, composed: true });
  target.dispatchEvent(event);

  return { ok: true, tool: 'emit_event', data: { eventName, selector: selector ?? 'document' } };
}

// ─── execute_bridge ─────────────────────────────────────────────────────────

function execBridge(input: ToolInput, bridge?: WebAgentBridge): ToolExecutionResult {
  // Also check window.__webAgentBridge
  const activeBridge = bridge ?? (typeof window !== 'undefined' ? (window as any).__webAgentBridge as WebAgentBridge | undefined : undefined);

  if (!activeBridge) {
    return { ok: false, tool: 'execute_bridge', error: 'No bridge registered. Use direct DOM manipulation tools instead.' };
  }

  const action = input.action as string;

  switch (action) {
    case 'getState': {
      const key = input.key as string;
      const value = activeBridge.getState(key);
      return { ok: true, tool: 'execute_bridge', data: { action, key, value } };
    }
    case 'setState': {
      const key = input.key as string;
      activeBridge.setState(key, input.value);
      return { ok: true, tool: 'execute_bridge', data: { action, key } };
    }
    case 'getComponents': {
      const components = activeBridge.getComponents();
      return { ok: true, tool: 'execute_bridge', data: { action, components } };
    }
    case 'triggerAction': {
      const actionName = input.action_name as string;
      activeBridge.triggerAction(actionName, input.payload);
      return { ok: true, tool: 'execute_bridge', data: { action, actionName } };
    }
    default:
      return { ok: false, tool: 'execute_bridge', error: `Unknown bridge action: ${action}` };
  }
}
