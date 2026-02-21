/**
 * lib/sections.ts
 * 
 * App-owned section configuration — independent of the agent.
 * The portfolio defines its sections here, and the agent enhances
 * this configuration at runtime when enabled.
 */

export const SECTION_KEYS = ['intro', 'about', 'footer'] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export interface SectionConfig {
  sectionOrder: SectionKey[];
  visibleSections: SectionKey[];
}

/**
 * Default section configuration.
 * This is used when the agent is disabled or has not yet run.
 */
export const DEFAULT_SECTION_CONFIG: SectionConfig = {
  sectionOrder: [...SECTION_KEYS],
  visibleSections: [...SECTION_KEYS],
};

/**
 * Create a section state with optional initial values.
 * Useful if the app wants to persist sections to localStorage or other state.
 */
export const createSectionState = (initial = DEFAULT_SECTION_CONFIG): SectionConfig => {
  return initial;
};
