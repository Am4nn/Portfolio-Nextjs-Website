import { createSnapshot } from "../snapshots/snapshot-manager";
import { ToolResult } from "../core/types";
import { ToolExecutionContext } from "./tool-registry";

export const saveStateSnapshotTool = (input: Record<string, unknown>, context: ToolExecutionContext): ToolResult => {
  const description = typeof input.description === "string" ? input.description : "manual snapshot";
  const snapshot = createSnapshot(context.getState(), description);

  context.dispatch({
    type: "SAVE_SNAPSHOT",
    payload: snapshot,
  });

  return {
    ok: true,
    tool: "saveStateSnapshot",
    data: {
      snapshotId: snapshot.id,
    },
  };
};

export const restoreStateSnapshotTool = (input: Record<string, unknown>, context: ToolExecutionContext): ToolResult => {
  const requestedSnapshotId = typeof input.snapshotId === "string" ? input.snapshotId : undefined;
  const latestSnapshotId = context.getState().snapshotOrder.at(-1);
  const snapshotId = requestedSnapshotId ?? latestSnapshotId;

  if (!snapshotId) {
    return {
      ok: false,
      tool: "restoreStateSnapshot",
      error: "No snapshot found to restore",
    };
  }

  context.dispatch({
    type: "REQUEST_RESTORE",
    payload: {
      snapshotId,
      reason: "manual restore request",
    },
  });

  return {
    ok: true,
    tool: "restoreStateSnapshot",
    data: { snapshotId },
  };
};
