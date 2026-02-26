/**
 * Tool definitions for Anthropic tool_use API.
 * Each tool has a name, description, and JSON schema for its input.
 */

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'read_dom',
    description: 'Read the full or partial DOM snapshot. Pass a CSS selector to scope the snapshot, or omit for the full page. Returns the HTML structure with text content, attributes, and element hierarchy.',
    input_schema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'Optional CSS selector to scope the snapshot. If omitted, reads the entire page body.',
        },
        max_depth: {
          type: 'number',
          description: 'Maximum depth of DOM tree to traverse. Default: 5.',
        },
      },
    },
  },
  {
    name: 'query_element',
    description: 'Query a specific element using a CSS selector. Returns the element\'s text content, attributes, computed styles, and bounding rect.',
    input_schema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector to find the element.',
        },
      },
      required: ['selector'],
    },
  },
  {
    name: 'mutate_element',
    description: 'Modify an existing DOM element. Can change text content, add/remove CSS classes, set inline styles, or change attributes.',
    input_schema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector of the element to mutate.',
        },
        text: {
          type: 'string',
          description: 'New text content for the element.',
        },
        html: {
          type: 'string',
          description: 'New innerHTML for the element.',
        },
        add_classes: {
          type: 'array',
          items: { type: 'string' },
          description: 'CSS classes to add.',
        },
        remove_classes: {
          type: 'array',
          items: { type: 'string' },
          description: 'CSS classes to remove.',
        },
        styles: {
          type: 'object',
          description: 'Inline styles to set as key-value pairs (e.g., {"color": "red", "font-size": "24px"}).',
        },
        attributes: {
          type: 'object',
          description: 'HTML attributes to set as key-value pairs.',
        },
        visible: {
          type: 'boolean',
          description: 'Set to false to hide the element (display: none), true to show.',
        },
      },
      required: ['selector'],
    },
  },
  {
    name: 'inject_html',
    description: 'Inject arbitrary HTML into the page at a specified selector and position.',
    input_schema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector of the target element.',
        },
        html: {
          type: 'string',
          description: 'HTML string to inject.',
        },
        position: {
          type: 'string',
          enum: ['beforebegin', 'afterbegin', 'beforeend', 'afterend', 'replace'],
          description: 'Where to inject relative to the target: beforebegin (before element), afterbegin (first child), beforeend (last child), afterend (after element), replace (replace element content).',
        },
      },
      required: ['selector', 'html', 'position'],
    },
  },
  {
    name: 'generate_and_inject',
    description: 'Generate a fully self-contained interactive UI component as HTML/CSS/JS and inject it into the page. Use this for creating calculators, forms, charts, widgets, games, countdown timers, etc. The generated code must be complete and functional with embedded styles and scripts. Choose the most appropriate injection location.',
    input_schema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'A detailed description of the component to generate. Include what it should do, look like, and any specific requirements.',
        },
        html: {
          type: 'string',
          description: 'The complete, self-contained HTML string including embedded <style> and <script> tags. Must be fully functional and beautifully styled.',
        },
        target_selector: {
          type: 'string',
          description: 'CSS selector for where to inject. If omitted, the agent chooses the best location.',
        },
        position: {
          type: 'string',
          enum: ['beforebegin', 'afterbegin', 'beforeend', 'afterend', 'replace'],
          description: 'Injection position relative to target. Default: afterbegin.',
        },
      },
      required: ['description', 'html'],
    },
  },
  {
    name: 'navigate',
    description: 'Navigate to a different URL or route.',
    input_schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The URL or path to navigate to.',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'click_element',
    description: 'Programmatically click a button, link, or any clickable element.',
    input_schema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector of the element to click.',
        },
      },
      required: ['selector'],
    },
  },
  {
    name: 'fill_form',
    description: 'Fill form fields by selector, name, label, or placeholder. Can fill multiple fields at once.',
    input_schema: {
      type: 'object',
      properties: {
        fields: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              selector: { type: 'string', description: 'CSS selector of the input.' },
              value: { type: 'string', description: 'Value to fill in.' },
            },
            required: ['selector', 'value'],
          },
          description: 'Array of fields to fill.',
        },
        submit: {
          type: 'boolean',
          description: 'Whether to submit the form after filling.',
        },
      },
      required: ['fields'],
    },
  },
  {
    name: 'get_storage',
    description: 'Read from localStorage or sessionStorage.',
    input_schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['local', 'session'],
          description: 'Which storage to read from.',
        },
        key: {
          type: 'string',
          description: 'Specific key to read. If omitted, returns all entries.',
        },
      },
    },
  },
  {
    name: 'set_storage',
    description: 'Write to localStorage or sessionStorage.',
    input_schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['local', 'session'],
          description: 'Which storage to write to.',
        },
        key: {
          type: 'string',
          description: 'Storage key.',
        },
        value: {
          type: 'string',
          description: 'Value to store.',
        },
      },
      required: ['type', 'key', 'value'],
    },
  },
  {
    name: 'get_page_data',
    description: 'Extract structured data from the page — headings, links, buttons, images, tables, and lists.',
    input_schema: {
      type: 'object',
      properties: {
        include: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['headings', 'links', 'buttons', 'images', 'tables', 'lists'],
          },
          description: 'What types of data to extract. Default: all.',
        },
      },
    },
  },
  {
    name: 'apply_theme',
    description: 'Apply bulk theme changes using CSS custom properties, class changes on html/body, or direct style modifications. Use this for dark mode, color scheme changes, and full-page theming.',
    input_schema: {
      type: 'object',
      properties: {
        css_variables: {
          type: 'object',
          description: 'CSS custom properties to set on :root (e.g., {"--bg-color": "#1a1a1a", "--text-color": "#fff"}).',
        },
        body_classes_add: {
          type: 'array',
          items: { type: 'string' },
          description: 'Classes to add to the body/html element.',
        },
        body_classes_remove: {
          type: 'array',
          items: { type: 'string' },
          description: 'Classes to remove from the body/html element.',
        },
        body_styles: {
          type: 'object',
          description: 'Inline styles to apply to the body element.',
        },
      },
    },
  },
  {
    name: 'highlight_element',
    description: 'Visually highlight an element on the page with a colored overlay/outline that auto-removes after a duration.',
    input_schema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector of the element to highlight.',
        },
        color: {
          type: 'string',
          description: 'Highlight color. Default: rgba(59, 130, 246, 0.3).',
        },
        duration: {
          type: 'number',
          description: 'Duration in milliseconds. Default: 3000.',
        },
      },
      required: ['selector'],
    },
  },
  {
    name: 'scroll_to',
    description: 'Scroll to a specific element or position on the page.',
    input_schema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector to scroll to.',
        },
        position: {
          type: 'object',
          properties: {
            x: { type: 'number' },
            y: { type: 'number' },
          },
          description: 'Absolute scroll position. Used if no selector is provided.',
        },
        behavior: {
          type: 'string',
          enum: ['smooth', 'instant'],
          description: 'Scroll behavior. Default: smooth.',
        },
      },
    },
  },
  {
    name: 'emit_event',
    description: 'Dispatch a custom DOM event on an element for the application to handle.',
    input_schema: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          description: 'CSS selector of the element to dispatch the event on. Default: document.',
        },
        event_name: {
          type: 'string',
          description: 'Name of the custom event.',
        },
        detail: {
          type: 'object',
          description: 'Event detail payload.',
        },
      },
      required: ['event_name'],
    },
  },
  {
    name: 'execute_bridge',
    description: 'Execute a bridge action to interact with the underlying framework (e.g., React state). Only available if a bridge is registered.',
    input_schema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['getState', 'setState', 'getComponents', 'triggerAction'],
          description: 'Bridge action to execute.',
        },
        key: {
          type: 'string',
          description: 'State key for getState/setState.',
        },
        value: {
          description: 'Value for setState.',
        },
        action_name: {
          type: 'string',
          description: 'Action name for triggerAction.',
        },
        payload: {
          description: 'Payload for triggerAction.',
        },
      },
      required: ['action'],
    },
  },
];
