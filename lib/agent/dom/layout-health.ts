"use client";

import { getTargetById, SECTION_REGISTRY, TARGET_REGISTRY } from "../registry";

const isDomConnected = (element: HTMLElement) => {
  return element.isConnected && document.documentElement.contains(element);
};

const isVisibleElement = (element: Element | null) => {
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

export const runLayoutHealthCheck = (): { ok: boolean; reason?: string } => {
  const main = document.querySelector("#portfolio-main");
  if (!main || !(main instanceof HTMLElement)) {
    return {
      ok: false,
      reason: "Main layout root missing",
    };
  }

  if (!isDomConnected(main)) {
    return {
      ok: false,
      reason: "Main layout root detached from DOM",
    };
  }

  const mainRect = main.getBoundingClientRect();
  if (mainRect.height < 120 || mainRect.width < 200) {
    return {
      ok: false,
      reason: "Main layout appears collapsed",
    };
  }

  const requiredTargets = ["navbar", "footer"];
  for (const targetId of requiredTargets) {
    const target = getTargetById(targetId);
    if (!target) {
      continue;
    }

    const element = document.querySelector(target.selector);
    if (!element || !(element instanceof HTMLElement)) {
      return {
        ok: false,
        reason: `${targetId} target missing`,
      };
    }

    if (!isDomConnected(element)) {
      return {
        ok: false,
        reason: `${targetId} target detached`,
      };
    }
  }

  for (const target of TARGET_REGISTRY) {
    const element = document.querySelector(target.selector);
    if (element && element instanceof HTMLElement && !isDomConnected(element)) {
      return {
        ok: false,
        reason: `Controlled target detached: ${target.id}`,
      };
    }
  }

  const canvasTarget = getTargetById("hero-canvas");
  if (canvasTarget) {
    const canvasElement = document.querySelector(canvasTarget.selector);
    if (canvasElement && canvasElement instanceof HTMLElement && isVisibleElement(canvasElement)) {
      const canvasRect = canvasElement.getBoundingClientRect();
      const viewportArea = Math.max(1, window.innerWidth * window.innerHeight);
      const canvasArea = Math.max(0, canvasRect.width * canvasRect.height);
      const style = window.getComputedStyle(canvasElement);
      const zIndex = Number.parseInt(style.zIndex, 10);
      const isHighZ = Number.isFinite(zIndex) && zIndex >= 50;
      const capturesPointer = style.pointerEvents !== "none";
      const dominatesViewport = canvasArea / viewportArea > 0.92;

      if (dominatesViewport && capturesPointer && isHighZ) {
        return {
          ok: false,
          reason: "Canvas overlay dominance detected",
        };
      }
    }
  }

  const hasVisibleSection = SECTION_REGISTRY.some(section => {
    return isVisibleElement(document.querySelector(section.selector));
  });

  if (!hasVisibleSection) {
    return {
      ok: false,
      reason: "No visible section available",
    };
  }

  return {
    ok: true,
  };
};
