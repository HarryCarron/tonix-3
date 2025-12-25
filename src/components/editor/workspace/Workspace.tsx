import { useViewport } from "@/hooks/useViewport";
import "./Workspace.css";
import { NodeWrapper } from "@/components/nodes/node-wrapper/NodeWrapper";
import { Polysynth } from "@/components/instruments/polysynth/Polysynth";

import { EditorTool } from "@/types/editor/EditorTools";
import { useCallback, useEffect, useRef, useState } from "react";

interface WorkspaceProps {
  editorTool: EditorTool;
}

export function Workspace({ editorTool }: WorkspaceProps) {
  const { zoom, pan, zoomAt, setPan } = useViewport();
  const [panningEvent, setIsPanning] = useState<React.MouseEvent | undefined>();
  const hostElem = useRef<HTMLDivElement | null>(null);

  const _mouseMove = useCallback(
    (e: MouseEvent) => {
      setPan({
        x: e.clientX,
        y: e.clientY,
      });
    },
    [setPan]
  );

  useEffect(() => {
    const host = hostElem.current;

    if (panningEvent) {
      host?.addEventListener("mousemove", _mouseMove);
    } else {
      host!.removeEventListener("mousemove", _mouseMove);
    }
  }, [panningEvent, _mouseMove]);

  let interactionClasses: string = "";

  if (editorTool === EditorTool.pan) {
    interactionClasses += "cursor-grab ";

    if (panningEvent) {
      interactionClasses += "cursor-grabbing";
    }
  }

  return (
    <div
      ref={hostElem}
      onWheel={(e) => {
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        zoomAt(e.clientX, e.clientY, factor);
      }}
      className={
        "w-full h-full workspace overflow-hidden relative " + interactionClasses
      }
      onMouseDown={(e: React.MouseEvent) => setIsPanning(e)}
      onMouseUp={() => setIsPanning(undefined)}
    >
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
        className="h-full w-full absolute workspace-inner"
      >
        <NodeWrapper>
          <Polysynth />
        </NodeWrapper>
      </div>
    </div>
  );
}
