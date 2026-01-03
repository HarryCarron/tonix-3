import { useViewport } from "@/hooks/useViewport";
import "./Workspace.css";

import { EditorTool } from "@/types/editor/EditorTools";
import React, { useEffect, useRef, useState } from "react";
import { World } from "../world/World";
import { Coords } from "@/types/global/Coords";
import { PanStateHandlers } from "./state-handlers/pan";
import { PanHandler } from "@/utils/pan-handler";

interface WorkspaceProps {
  editorTool: EditorTool;
}

export function Workspace({ editorTool }: WorkspaceProps) {
  const { zoomAt, setPan } = useViewport();
  const [mouseEvent] = useState<React.MouseEvent>();

  const hostRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);

  const panHandlerRef = useRef<PanHandler>(new PanHandler());

  useEffect(() => {
    const host = hostRef.current!;
    const world = worldRef.current!;
    const panHandler = panHandlerRef.current!;

    panHandler.onChange((transform: string) => {
      world.style.transform = transform;
    });

    panHandler.onDone((newPan: Coords) => {
      setPan(newPan);
    });

    panHandler.setHost(host);

    panHandler.listen();

    return () => {
      panHandler.done();
    };
  }, []);

  const classes = PanStateHandlers.setInteractionClasses(
    editorTool === EditorTool.pan,
    !!mouseEvent
  );

  return (
    <div
      id="camera"
      ref={hostRef}
      onWheel={(e) => {
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        zoomAt(e.clientX, e.clientY, factor);
      }}
      className={"w-full h-full overflow-hidden relative " + classes}
    >
      <span ref={worldRef} className="absolute">
        <World />
      </span>
    </div>
  );
}
