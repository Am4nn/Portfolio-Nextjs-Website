import { ALLOWED_CSS_PROPERTIES } from "../core/constants";
import { AgentDiscoverySnapshot, ToolCall } from "../core/types";
import { SECTION_KEYS, getTargetById } from "../registry";

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

const normalizeCssProperty = (property: string) => property.trim().toLowerCase();

const isValidStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every(item => typeof item === "string");
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const validateTarget = (id: unknown) => {
  if (typeof id !== "string") {
    return false;
  }
  return Boolean(getTargetById(id));
};

const validateUpdateCss = (input: Record<string, unknown>): ValidationResult => {
  if (!validateTarget(input.id)) {
    return { ok: false, error: "Unknown target id for updateCSS" };
  }
  if (!isRecord(input.styleObject)) {
    return { ok: false, error: "styleObject must be an object" };
  }

  const hasUnsupportedProperty = Object.keys(input.styleObject).some(property => {
    return !ALLOWED_CSS_PROPERTIES.includes(normalizeCssProperty(property) as typeof ALLOWED_CSS_PROPERTIES[number]);
  });

  if (hasUnsupportedProperty) {
    return { ok: false, error: "CSS property not allowed by whitelist" };
  }

  return { ok: true };
};

const validateTextMutation = (input: Record<string, unknown>): ValidationResult => {
  if (!validateTarget(input.id)) {
    return { ok: false, error: "Unknown target id for updateText" };
  }
  if (typeof input.content !== "string") {
    return { ok: false, error: "content must be a string" };
  }
  if (input.content.toLowerCase().includes("<script")) {
    return { ok: false, error: "Unsafe content blocked" };
  }
  return { ok: true };
};

const validateReplaceWithComponent = (input: Record<string, unknown>): ValidationResult => {
  if (!validateTarget(input.id)) {
    return { ok: false, error: "Unknown target id for replaceWithComponent" };
  }

  const componentName = typeof input.componentName === "string"
    ? input.componentName
    : (typeof input.name === "string" ? input.name : null);

  if (!componentName || componentName.trim().length === 0) {
    return { ok: false, error: "componentName must be a non-empty string" };
  }

  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(componentName.trim())) {
    return { ok: false, error: "componentName contains unsupported characters" };
  }

  return { ok: true };
};

const validateReorderSections = (input: Record<string, unknown>): ValidationResult => {
  if (!isValidStringArray(input.orderArray)) {
    return { ok: false, error: "orderArray must be a string array" };
  }

  // if (input.orderArray.length !== SECTION_KEYS.length) {
  //   return { ok: false, error: "orderArray must include all sections exactly once" };
  // }

  const unknown = input.orderArray.filter(section => !SECTION_KEYS.includes(section));
  if (unknown.length > 0) {
    return { ok: false, error: `Unknown sections in orderArray: ${unknown.join(", ")}` };
  }

  const hasDuplicates = new Set(input.orderArray).size !== input.orderArray.length;
  if (hasDuplicates) {
    return { ok: false, error: "orderArray contains duplicate section ids" };
  }

  const missingSections = SECTION_KEYS.filter(section => !input.orderArray.includes(section));
  if (missingSections.length > 0) {
    return { ok: false, error: `Missing sections in orderArray: ${missingSections.join(", ")}` };
  }

  return { ok: true };
};

export const validateToolCall = (
  call: ToolCall,
  discovery: AgentDiscoverySnapshot | null
): ValidationResult => {
  const input = call.input ?? {};

  switch (call.name) {
    case "updateCSS":
      return validateUpdateCss(input);
    case "addClass":
    case "removeClass":
      if (!validateTarget(input.id)) {
        return { ok: false, error: `Unknown target id for ${call.name}` };
      }
      if (typeof input.className !== "string") {
        return { ok: false, error: "className must be a string" };
      }
      return { ok: true };
    case "animate":
      if (!validateTarget(input.id)) {
        console.log('❤️', input.id, discovery);
        return { ok: false, error: "Unknown target id for animate" };
      }
      if (typeof input.animationType !== "string") {
        return { ok: false, error: "animationType must be a string" };
      }
      return { ok: true };
    case "changeTheme":
      if (input.themeName !== "light" && input.themeName !== "dark") {
        return { ok: false, error: "themeName must be light or dark" };
      }
      return { ok: true };
    case "toggleSection":
      if (typeof input.id !== "string" || !SECTION_KEYS.includes(input.id)) {
        return { ok: false, error: "toggleSection requires a known section id" };
      }
      return { ok: true };
    case "reorderSections":
      return validateReorderSections(input);
    case "changeLayout":
      if (typeof input.mode !== "string") {
        return { ok: false, error: "mode must be a string" };
      }
      return { ok: true };
    case "updateText":
      return validateTextMutation(input);
    case "replaceWithComponent":
      return validateReplaceWithComponent(input);
    case "drawDiagram":
    case "clearCanvas":
    case "animateTraffic":
    case "changeCameraMode":
    case "saveStateSnapshot":
      return { ok: true };
    case "restoreStateSnapshot":
      if (input.snapshotId !== undefined && typeof input.snapshotId !== "string") {
        return { ok: false, error: "snapshotId must be a string when provided" };
      }
      return { ok: true };
    case "getComputedStyleSummary":
      if (!validateTarget(input.id)) {
        return { ok: false, error: "Unknown target id for getComputedStyleSummary" };
      }
      return { ok: true };
    case "listComponents":
    case "getDOMTreeSummary":
    case "getTheme":
    case "getLayoutMode":
      return { ok: true };
    default:
      return { ok: false, error: `Unsupported tool: ${call.name}` };
  }
};

export const ensureDiscoveryFirst = (
  call: ToolCall,
  discovery: AgentDiscoverySnapshot | null
): ValidationResult => {
  if (
    call.name === "getDOMTreeSummary" ||
    call.name === "getComputedStyleSummary" ||
    call.name === "listComponents" ||
    call.name === "getTheme" ||
    call.name === "getLayoutMode" ||
    call.name === "saveStateSnapshot" ||
    call.name === "restoreStateSnapshot"
  ) {
    return { ok: true };
  }
  if (!discovery) {
    return { ok: false, error: "Discovery is required before mutation tools" };
  }
  return { ok: true };
};
