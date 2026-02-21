import { AgentTarget } from "../core/types";

export const TARGET_REGISTRY: AgentTarget[] = [
  { id: "portfolio-main", selector: "#portfolio-main", type: "layout" },
  { id: "intro", selector: "#intro", type: "section" },
  { id: "about", selector: "#about", type: "section" },
  { id: "footer", selector: "[data-agent-id='footer']", type: "section" },
  { id: "navbar", selector: "[data-agent-id='navbar']", type: "component" },
  { id: "hero-canvas", selector: "[data-agent-id='hero-canvas']", type: "canvas" },
];

export const CONTROLLED_SELECTOR_LIST = TARGET_REGISTRY.map(target => target.selector);

export const TARGET_REGISTRY_BY_ID = TARGET_REGISTRY.reduce<Record<string, AgentTarget>>(
  (accumulator, target) => {
    accumulator[target.id] = target;
    return accumulator;
  },
  {}
);

export const getTargetById = (id: string) => TARGET_REGISTRY_BY_ID[id];
