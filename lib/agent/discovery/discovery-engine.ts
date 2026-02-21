"use client";

import { AgentComponentMeta, AgentDiscoverySnapshot } from "../core/types";
import { SECTION_REGISTRY, TARGET_REGISTRY } from "../registry";

const readVisibility = (element: Element | null) => {
  if (!element || !(element instanceof HTMLElement)) {
    return false;
  }

  if (element.hasAttribute("hidden")) {
    return false;
  }

  const computedStyle = window.getComputedStyle(element);
  if (computedStyle.display === "none") {
    return false;
  }
  if (computedStyle.visibility === "hidden") {
    return false;
  }
  return computedStyle.opacity !== "0";
};

const readTheme = (): "light" | "dark" => {
  if (document.documentElement.classList.contains("dark")) {
    return "dark";
  }
  return "light";
};

export const buildDiscoverySnapshot = (layoutMode: string): AgentDiscoverySnapshot => {
  const componentMap = new Map<string, AgentComponentMeta>();

  TARGET_REGISTRY.forEach(target => {
    const element = document.querySelector(target.selector);
    componentMap.set(target.id, {
      id: target.id,
      selector: target.selector,
      type: target.type,
      visible: readVisibility(element),
    });
  });

  SECTION_REGISTRY.forEach(section => {
    const element = document.querySelector(section.selector);
    componentMap.set(section.id, {
      id: section.id,
      selector: section.selector,
      type: "section",
      visible: readVisibility(element),
    });
  });

  return {
    components: Array.from(componentMap.values()),
    theme: readTheme(),
    layoutMode,
    createdAt: Date.now(),
  };
};
