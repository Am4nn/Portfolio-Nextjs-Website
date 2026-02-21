import { AgentSection } from "../core/types";

export const SECTION_REGISTRY: AgentSection[] = [
  { id: "intro", selector: "#intro" },
  { id: "about", selector: "#about" },
  { id: "footer", selector: "[data-agent-id='footer']" },
];

export const SECTION_KEYS = SECTION_REGISTRY.map(section => section.id);
