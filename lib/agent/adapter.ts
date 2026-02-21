/**
 * lib/agent/adapter.ts
 * 
 * Adapter to sync agent runtime state with app-owned section config.
 * 
 * The agent runtime can notify the app of UI state changes
 * (e.g., reordering sections, toggling visibility) without hard-coding
 * app dependencies into the agent code.
 * 
 * This adapter is only loaded/registered when the agent is enabled.
 */

export interface SectionAdapter {
  setSectionOrder?: (order: string[]) => void;
  setVisibleSections?: (visible: string[]) => void;
}

let sectionAdapter: SectionAdapter | null = null;

/**
 * Register the adapter so agent can notify app of changes.
 */
export const setSectionAdapter = (newAdapter: SectionAdapter) => {
  sectionAdapter = newAdapter;
};

/**
 * Retrieve the currently registered adapter.
 */
export const getSectionAdapter = () => sectionAdapter;

/**
 * Call this from agent tools to update section order.
 * The app's adapter will handle the actual state update.
 */
export const updateSectionOrder = (order: string[]) => {
  sectionAdapter?.setSectionOrder?.(order);
};

/**
 * Call this from agent tools to update visible sections.
 * The app's adapter will handle the actual state update.
 */
export const updateVisibleSections = (visible: string[]) => {
  sectionAdapter?.setVisibleSections?.(visible);
};
