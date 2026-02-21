"use client";

import { AgentSnapshot, AgentState, AgentTargetBaseline } from "../core/types";

const randomId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const deepClone = <T,>(value: T): T => {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
};

export const createSnapshot = (
  state: AgentState,
  description: string,
  options?: { baselines?: Record<string, AgentTargetBaseline> }
): AgentSnapshot => {
  const baselines = options?.baselines ?? state.baselines;

  return {
    id: randomId(),
    createdAt: Date.now(),
    description,
    baselines: deepClone(baselines),
    ui: {
      theme: state.theme,
      layoutMode: state.layoutMode,
      sectionOrder: deepClone(state.sectionOrder),
      visibleSections: deepClone(state.visibleSections),
    },
  };
};

export const createBaselineFromElement = (targetId: string, element: HTMLElement): AgentTargetBaseline => {
  const styles: Record<string, string> = {};
  for (let index = 0; index < element.style.length; index += 1) {
    const property = element.style.item(index);
    styles[property] = element.style.getPropertyValue(property);
  }

  return {
    targetId,
    className: element.className,
    style: styles,
    textContent: element.textContent,
    restoreText: element.children.length === 0,
    hidden: element.hasAttribute("hidden"),
    display: element.style.display,
    order: element.style.order,
  };
};

export const applyBaselineToElement = (baseline: AgentTargetBaseline, element: HTMLElement) => {
  element.className = baseline.className;
  if (baseline.restoreText) {
    element.textContent = baseline.textContent;
  }

  element.removeAttribute("style");
  Object.entries(baseline.style).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });

  element.style.display = baseline.display;
  element.style.order = baseline.order;

  if (baseline.hidden) {
    element.setAttribute("hidden", "");
  } else {
    element.removeAttribute("hidden");
  }
};
