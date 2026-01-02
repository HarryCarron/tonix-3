import { useViewport } from "@/hooks/useViewport";
import "./Workspace.css";

import { EditorTool } from "@/types/editor/EditorTools";
import React, { useEffect, useRef, useState } from "react";
import { World } from "../world/World";
import { Coords } from "@/types/global/Coords";
import { PanHandler } from "@/utils/pan-handler";
import { PanStateHandlers } from "./state-handlers/pan";

interface WorkspaceProps {
  editorTool: EditorTool;
}

export function Workspace({ editorTool }: WorkspaceProps) {
  const { pan, zoomAt, setPan } = useViewport();
  const [mouseEvent, setMouseEvent] = useState<React.MouseEvent>();
  const hostElem = useRef<HTMLDivElement | null>(null);

  const worldRef = useRef<HTMLDivElement | null>(null);

  const panHandler = useRef<PanHandler>(new PanHandler());

  const ephemeralPan = useRef<Coords | undefined>(new Coords());

  useEffect(() => {
    if (!mouseEvent) return;

    const host = hostElem.current!;
    const world = worldRef.current!;
    const basePan = pan ?? new Coords();

    panHandler.current.listen(
      (pos: Coords) => {
        ephemeralPan.current = pos;

        const x = basePan.x + pos.x;
        const y = basePan.y + pos.y;

        world.style.transform = `translate(${x}px, ${y}px) scale(1)`;
      },
      mouseEvent,
      host
    );
  }, [mouseEvent]);

  useEffect(() => {
    if (mouseEvent) return;

    const delta = ephemeralPan.current;
    if (!delta) return;

    setPan((prev) => {
      return new Coords(prev.x + delta.x, prev.y + delta.y);
    });

    ephemeralPan.current = undefined;
  }, [mouseEvent]);

  const classes = PanStateHandlers.setInteractionClasses(
    editorTool === EditorTool.pan,
    !!mouseEvent
  );

  return (
    <div
      id="camera"
      ref={hostElem}
      onWheel={(e) => {
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        zoomAt(e.clientX, e.clientY, factor);
      }}
      className={"w-full h-full overflow-hidden relative " + classes}
      onMouseDown={(e) => {
        setMouseEvent(e);
      }}
      onMouseUp={() => {
        setMouseEvent(undefined);
      }}
    >
      <span ref={worldRef} className="absolute">
        <World />
      </span>
    </div>
  );
}
