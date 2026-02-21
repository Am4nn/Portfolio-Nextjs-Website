"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Divider, Input } from "@nextui-org/react";
import { Bot, ChevronDown, GripHorizontal, RotateCw } from "lucide-react";
import { AGENT_ENABLED } from "../core/config";
import { useAgent } from "../state/agent-context";
import styles from "./AgentPanel.module.css";

type ActivityKind = "neutral" | "success" | "warn" | "error";

interface ActivityItem {
  text: string;
  kind: ActivityKind;
}

const getStatusMeta = (state: ReturnType<typeof useAgent>["state"]) => {
  const lastLog = state.logs[state.logs.length - 1]?.message ?? "";
  const rolledBack = lastLog.includes("Restored snapshot");

  if (state.status === "error") {
    return { label: "Error", tone: "error", active: false };
  }

  if (rolledBack) {
    return { label: "Rolled back", tone: "warn", active: false };
  }

  if (state.status === "planning") {
    return { label: "Planning...", tone: "running", active: true };
  }

  if (state.status === "executing") {
    const actionCount = Math.max(1, state.pendingMutations.length);
    return { label: `Executing ${actionCount} actions...`, tone: "running", active: true };
  }

  if (state.status === "reflecting") {
    return {
      label: `Reflecting (${Math.max(1, state.iteration)}/${state.maxIterations})`,
      tone: "running",
      active: true,
    };
  }

  if (state.status === "idle" && state.currentGoal) {
    return { label: "Complete", tone: "success", active: false };
  }

  return { label: "Idle", tone: "idle", active: false };
};

const mapLogMessage = (message: string) => {
  if (message.includes("Goal received")) return "Analyzing your instruction";
  if (message.includes("Planner source")) return "Planning mutation strategy";
  if (message.includes("Tool changeTheme executed")) return "Applying theme change";
  if (message.includes("Tool reorderSections executed")) return "Reordering sections";
  if (message.includes("Tool toggleSection executed")) return "Updating section visibility";
  if (message.includes("Layout health")) return "Validating layout integrity";
  if (message.includes("Restored snapshot")) return "Rollback completed safely";
  if (message.includes("Reflection:")) return message.replace("Reflection:", "").trim();
  if (message.includes("Runtime error")) return "Runtime reported an error";
  return message;
};

const mapLogKind = (level: "info" | "warn" | "error", text: string): ActivityKind => {
  if (level === "error") return "error";
  if (level === "warn") return "warn";
  if (text.includes("completed") || text.includes("executed") || text.includes("ready") || text.includes("Complete")) {
    return "success";
  }
  return "neutral";
};

const getActivity = (state: ReturnType<typeof useAgent>["state"]): ActivityItem[] => {
  if (state.logs.length === 0) {
    return [{ text: "Awaiting instructions...", kind: "neutral" }];
  }

  const mapped = state.logs.slice(-8).map(log => {
    const text = mapLogMessage(log.message);
    return {
      text,
      kind: mapLogKind(log.level, text),
    };
  });

  return mapped;
};

const getMarkerClass = (kind: ActivityKind) => {
  if (kind === "success") return `${styles.marker} ${styles.markerSuccess}`;
  if (kind === "warn") return `${styles.marker} ${styles.markerWarn}`;
  if (kind === "error") return `${styles.marker} ${styles.markerError}`;
  return `${styles.marker} ${styles.markerNeutral}`;
};

const getStatusToneClass = (tone: string) => {
  if (tone === "running") return styles.toneRunning;
  if (tone === "success") return styles.toneSuccess;
  if (tone === "warn") return styles.toneWarn;
  if (tone === "error") return styles.toneError;
  return "";
};

const getStatusDotToneClass = (tone: string) => {
  if (tone === "running") return styles.statusDotToneRunning;
  if (tone === "success") return styles.statusDotToneSuccess;
  if (tone === "warn") return styles.statusDotToneWarn;
  if (tone === "error") return styles.statusDotToneError;
  return "";
};

const joinClassNames = (...classNames: Array<string | undefined | false>) => {
  return classNames.filter(Boolean).join(" ");
};

const AgentPanelEnabled: React.FC = () => {
  const { state, runGoal, stopRun, restoreSnapshot } = useAgent();
  const [goal, setGoal] = useState("");
  const [open, setOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(true);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dockRef = useRef<HTMLDivElement | null>(null);
  const suppressOpenRef = useRef(false);
  const dragStateRef = useRef<{
    active: boolean;
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  }>({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    moved: false,
  });

  const status = getStatusMeta(state);

  const activity = useMemo(() => {
    return getActivity(state);
  }, [state]);

  const run = async () => {
    await runGoal(goal);
  };

  const clampPositionToViewport = useCallback((target: { x: number; y: number }) => {
    const dock = dockRef.current;
    if (!dock) {
      return target;
    }
    const rect = dock.getBoundingClientRect();
    const minMargin = 8;
    const maxX = Math.max(minMargin, window.innerWidth - rect.width - minMargin);
    const maxY = Math.max(minMargin, window.innerHeight - rect.height - minMargin);

    return {
      x: Math.min(Math.max(minMargin, target.x), maxX),
      y: Math.min(Math.max(minMargin, target.y), maxY),
    };
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    const dragState = dragStateRef.current;
    if (!dragState.active || event.pointerId !== dragState.pointerId) {
      return;
    }

    const dock = dockRef.current;
    if (!dock) {
      return;
    }

    const dx = event.clientX - dragState.startX;
    const dy = event.clientY - dragState.startY;
    const nextX = dragState.originX + dx;
    const nextY = dragState.originY + dy;
    const clamped = clampPositionToViewport({
      x: nextX,
      y: nextY,
    });

    if (Math.abs(dx) + Math.abs(dy) > 4) {
      dragState.moved = true;
    }

    setPosition({
      x: clamped.x,
      y: clamped.y,
    });
  }, [clampPositionToViewport]);

  const handlePointerUp = useCallback((event: PointerEvent) => {
    const dragState = dragStateRef.current;
    if (!dragState.active || event.pointerId !== dragState.pointerId) {
      return;
    }

    const moved = dragState.moved;
    dragState.active = false;
    setIsDragging(false);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerUp);

    if (moved) {
      suppressOpenRef.current = true;
      window.setTimeout(() => {
        suppressOpenRef.current = false;
      }, 0);
    }
  }, [handlePointerMove]);

  const handleDragStart = useCallback((event: React.PointerEvent) => {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    const dock = dockRef.current;
    if (!dock) {
      return;
    }

    const rect = dock.getBoundingClientRect();
    dragStateRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position ? position.x : rect.left,
      originY: position ? position.y : rect.top,
      moved: false,
    };

    setIsDragging(true);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  }, [handlePointerMove, handlePointerUp, position]);

  const handleOpen = () => {
    if (suppressOpenRef.current) {
      return;
    }
    setOpen(true);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  useEffect(() => {
    if (!position) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      const clamped = clampPositionToViewport(position);
      if (clamped.x !== position.x || clamped.y !== position.y) {
        setPosition(clamped);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open, position, clampPositionToViewport]);

  useEffect(() => {
    if (!position) {
      return;
    }
    const onResize = () => {
      const clamped = clampPositionToViewport(position);
      if (clamped.x !== position.x || clamped.y !== position.y) {
        setPosition(clamped);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [position, clampPositionToViewport]);

  return (
    <div
      ref={dockRef}
      className={joinClassNames(styles.agentDock, isDragging && styles.isDragging)}
      data-agent-id="agent-panel"
      style={position ? { left: `${position.x}px`, top: `${position.y}px`, right: "auto", bottom: "auto" } : undefined}
    >
      {open ? (
        <section className={styles.panelRoot}>
          <header className={styles.panelHeader}>
            <div className={styles.titleRow}>
              <h3>AI Control</h3>
              <div
                className={styles.dragHandle}
                role="button"
                tabIndex={0}
                onPointerDown={handleDragStart}
                aria-label="Drag AI Control panel"
              >
                <GripHorizontal size={13} />
                <span>Drag</span>
              </div>
            </div>
            <div className={styles.headerActions}>
              <Button size="sm" radius="sm" variant="bordered" className={styles.closeBtn} onPress={() => setOpen(false)}>
                x Close
              </Button>
            </div>
          </header>

          <div className={styles.panelBody}>
            <div className={styles.statusRow}>
              <div className={styles.statusText}>
                <span
                  className={joinClassNames(
                    styles.statusDot,
                    getStatusDotToneClass(status.tone),
                    status.active && styles.pulse
                  )}
                />
                <span className={joinClassNames(styles.statusLabel, getStatusToneClass(status.tone))}>{status.label}</span>
              </div>
              <div className={styles.iterPill}>
                <RotateCw size={12} className={styles.iterIcon} />
                <span>Iterations: {state.iteration}</span>
              </div>
            </div>

            <Input
              size="sm"
              radius="sm"
              variant="bordered"
              value={goal}
              onValueChange={setGoal}
              placeholder="What should I change?"
              className={styles.goalInput}
            />

            <Divider className={styles.divider} />

            <div className={styles.actions}>
              <Button
                size="sm"
                radius="sm"
                color="primary"
                variant="solid"
                className={joinClassNames(styles.actionBtn, styles.runBtn)}
                onPress={run}
              >
                Run
              </Button>
              <Button size="sm" radius="sm" variant="bordered" className={styles.actionBtn} onPress={stopRun}>Stop</Button>
              <Button size="sm" radius="sm" variant="bordered" className={styles.actionBtn} onPress={() => restoreSnapshot()}>Restore</Button>
            </div>

            <Divider className={styles.divider} />

            <div className={styles.activityBlock}>
              <button
                type="button"
                className={styles.activityToggle}
                onClick={() => setActivityOpen(value => !value)}
                aria-expanded={activityOpen}
              >
                <h4>Activity</h4>
                <ChevronDown size={14} className={joinClassNames(styles.activityCaret, activityOpen && styles.activityCaretOpen)} />
              </button>
              {activityOpen ? (
                <ul className={styles.activityList}>
                  {activity.map((item, index) => (
                    <li key={`${item.text}-${index}`} className={styles.activityItem}>
                      <span className={getMarkerClass(item.kind)} />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </section>
      ) : (
        <div className={styles.collapsedShell} role="group" aria-label="AI Control">
          <button type="button" className={styles.collapsedMain} onClick={handleOpen} aria-label="Open AI Control">
            <Bot size={14} className={styles.collapsedIcon} />
            <span>AI Control</span>
          </button>
          <div
            className={styles.collapsedDragZone}
            role="button"
            tabIndex={0}
            onPointerDown={handleDragStart}
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
            }}
            aria-label="Drag AI Control"
          >
            <GripHorizontal size={13} className={styles.dragCue} />
          </div>
        </div>
      )}
    </div>
  );
};

export const AgentPanel: React.FC = () => {
  if (!AGENT_ENABLED) {
    return null;
  }

  return <AgentPanelEnabled />;
};
