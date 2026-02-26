import type { BrowserContext, FormInfo, FormFieldInfo } from './types';

/**
 * Get a full browser context snapshot — DOM structure, URL, viewport, forms, meta tags.
 */
export function getBrowserContext(): BrowserContext {
  return {
    url: window.location.href,
    title: document.title,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    scrollPosition: {
      x: window.scrollX,
      y: window.scrollY,
    },
    domSnapshot: getDomSnapshot(document.body, 0, 4),
    forms: getFormsInfo(),
    metaTags: getMetaTags(),
    dataAttributes: getDataAttributes(),
  };
}

/**
 * Create a readable DOM snapshot — text, structure, aria labels, key attributes.
 */
function getDomSnapshot(el: Element, depth: number, maxDepth: number): string {
  if (depth > maxDepth) return '';

  const tag = el.tagName.toLowerCase();
  const skipTags = new Set(['script', 'style', 'noscript', 'svg', 'path', 'link', 'meta']);
  if (skipTags.has(tag)) return '';

  const indent = '  '.repeat(depth);
  const parts: string[] = [];

  // Element attributes worth surfacing
  const id = el.id ? ` id="${el.id}"` : '';
  const cls = el.className && typeof el.className === 'string'
    ? ` class="${el.className.split(' ').slice(0, 3).join(' ')}${el.className.split(' ').length > 3 ? '...' : ''}"`
    : '';
  const ariaLabel = el.getAttribute('aria-label') ? ` aria-label="${el.getAttribute('aria-label')}"` : '';
  const role = el.getAttribute('role') ? ` role="${el.getAttribute('role')}"` : '';
  const href = el.getAttribute('href') ? ` href="${el.getAttribute('href')}"` : '';
  const src = el.getAttribute('src') ? ` src="${el.getAttribute('src')}"` : '';

  parts.push(`${indent}<${tag}${id}${cls}${role}${ariaLabel}${href}${src}>`);

  // Direct text content (not from children)
  const directText = getDirectTextContent(el).trim();
  if (directText) {
    const truncated = directText.length > 100 ? directText.slice(0, 100) + '...' : directText;
    parts.push(`${indent}  "${truncated}"`);
  }

  // Recurse into children
  for (const child of Array.from(el.children)) {
    const childSnapshot = getDomSnapshot(child, depth + 1, maxDepth);
    if (childSnapshot) parts.push(childSnapshot);
  }

  return parts.join('\n');
}

/**
 * Get direct text content of an element (not inherited from children).
 */
function getDirectTextContent(el: Element): string {
  return Array.from(el.childNodes)
    .filter(node => node.nodeType === Node.TEXT_NODE)
    .map(node => node.textContent?.trim() ?? '')
    .filter(Boolean)
    .join(' ');
}

/**
 * Extract info about all forms on the page.
 */
function getFormsInfo(): FormInfo[] {
  return Array.from(document.querySelectorAll('form')).map(form => {
    const fields: FormFieldInfo[] = Array.from(
      form.querySelectorAll('input, textarea, select')
    ).map(field => {
      const el = field as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const labelEl = el.id ? document.querySelector(`label[for="${el.id}"]`) : null;
      return {
        selector: getUniqueSelector(el),
        type: el.tagName.toLowerCase() === 'select' ? 'select' : (el as HTMLInputElement).type || 'text',
        name: el.name || undefined,
        label: labelEl?.textContent?.trim() || el.getAttribute('aria-label') || undefined,
        placeholder: (el as HTMLInputElement).placeholder || undefined,
        value: el.value || undefined,
      };
    });

    return {
      selector: getUniqueSelector(form),
      id: form.id || undefined,
      action: form.action || undefined,
      fields,
    };
  });
}

/**
 * Extract all meta tags as key-value pairs.
 */
function getMetaTags(): Record<string, string> {
  const meta: Record<string, string> = {};
  document.querySelectorAll('meta').forEach(el => {
    const name = el.getAttribute('name') || el.getAttribute('property') || el.getAttribute('http-equiv');
    const content = el.getAttribute('content');
    if (name && content) meta[name] = content;
  });
  return meta;
}

/**
 * Find elements with data-* attributes.
 */
function getDataAttributes(): { selector: string; attributes: Record<string, string> }[] {
  const results: { selector: string; attributes: Record<string, string> }[] = [];
  document.querySelectorAll('[data-agent-id], [data-section], [data-component]').forEach(el => {
    const attrs: Record<string, string> = {};
    Array.from(el.attributes)
      .filter(a => a.name.startsWith('data-'))
      .forEach(a => { attrs[a.name] = a.value; });
    if (Object.keys(attrs).length > 0) {
      results.push({ selector: getUniqueSelector(el), attributes: attrs });
    }
  });
  return results;
}

/**
 * Generate a unique CSS selector for an element.
 */
export function getUniqueSelector(el: Element): string {
  if (el.id) return `#${el.id}`;

  const tag = el.tagName.toLowerCase();
  const parent = el.parentElement;
  if (!parent) return tag;

  const sameTagSiblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
  if (sameTagSiblings.length === 1) {
    return `${getUniqueSelector(parent)} > ${tag}`;
  }

  const index = sameTagSiblings.indexOf(el) + 1;
  return `${getUniqueSelector(parent)} > ${tag}:nth-of-type(${index})`;
}

/**
 * Extract structured page data — headings, links, tables, lists.
 */
export function getPageData(): Record<string, unknown> {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
    level: parseInt(h.tagName[1]),
    text: h.textContent?.trim() ?? '',
    selector: getUniqueSelector(h),
  }));

  const links = Array.from(document.querySelectorAll('a[href]')).slice(0, 50).map(a => ({
    text: a.textContent?.trim() ?? '',
    href: a.getAttribute('href') ?? '',
    selector: getUniqueSelector(a),
  }));

  const buttons = Array.from(document.querySelectorAll('button, [role="button"], input[type="submit"]')).map(b => ({
    text: b.textContent?.trim() ?? '',
    selector: getUniqueSelector(b),
    disabled: (b as HTMLButtonElement).disabled ?? false,
  }));

  const images = Array.from(document.querySelectorAll('img')).slice(0, 30).map(img => ({
    alt: img.getAttribute('alt') ?? '',
    src: img.getAttribute('src') ?? '',
    selector: getUniqueSelector(img),
  }));

  return { headings, links, buttons, images };
}
