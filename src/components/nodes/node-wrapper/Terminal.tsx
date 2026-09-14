import { useEffect, useRef } from "react";
import { DragAndDrop } from "@/utils/drag-and-drop";
import { useConnections } from "@/context/connections/ConnectionsContext";

export type TerminalSide = "input" | "output";

interface TerminalProps {
  nodeId: string;
  side: TerminalSide;
}

/**
 * A node's connection point: `input` (left) terminals are just a drop
 * target, `output` (right) terminals also start a drag-to-connect gesture.
 * Signal is meant to flow left-to-right, matching tonix-2-react's reference
 * layout this was ported from.
 */
export function Terminal({ nodeId, side }: TerminalProps) {
  const elRef = useRef<HTMLDivElement | null>(null);

  const { terminalContentPoint, clientContentPoint, beginAttempt, updateAttempt, commitAttempt, cancelAttempt } =
    useConnections();

  useEffect(() => {
    if (side !== "output") {
      return;
    }

    const el = elRef.current!;
    const dd = new DragAndDrop().setHost(el);

    dd.listen(({ type, e }) => {
      if (type === "start") {
        const from = terminalContentPoint(el);

        if (from) {
          beginAttempt(nodeId, from);
        }

        return;
      }

      if (type === "dragging") {
        const to = clientContentPoint(e.clientX, e.clientY);

        if (to) {
          updateAttempt(to);
        }

        return;
      }

      // "done": commit only if released over a different node's input terminal
      const target = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest<HTMLElement>('[data-terminal-side="input"]');

      const targetNodeId = target?.dataset.nodeId;

      if (target && targetNodeId && targetNodeId !== nodeId) {
        const to = terminalContentPoint(target);

        if (to) {
          commitAttempt(to);
          return;
        }
      }

      cancelAttempt();
    });

    return () => dd.done();
  }, [
    side,
    nodeId,
    terminalContentPoint,
    clientContentPoint,
    beginAttempt,
    updateAttempt,
    commitAttempt,
    cancelAttempt,
  ]);

  return (
    <div
      ref={elRef}
      data-node-id={nodeId}
      data-terminal-side={side}
      className={
        "w-3 h-3 rounded-full border-2 border-white shadow-sm shrink-0 " +
        (side === "output"
          ? "bg-stone-500 cursor-crosshair"
          : "bg-stone-300")
      }
    />
  );
}
