import { useViewport } from "@/hooks/useViewport";
import "./Workspace.css";

import { EditorTool } from "@/types/editor/EditorTools";
import React, { useEffect, useRef, useState } from "react";
import { World } from "../world/World";
import { PanStateHandlers } from "./state-handlers/pan";
import { InteractionHandler } from "@/utils/interaction-handler";
import type { Coords } from "@/types/global/Coords";

interface WorkspaceProps {
  editorTool: EditorTool;
}

export function Workspace({ editorTool }: WorkspaceProps) {
  // const { zoomAt, setPan } = useViewport();

  const [, setPan] = useState<Coords | undefined>();
  const [, setZoom] = useState<number | undefined>();
  const [mouseEvent] = useState<React.MouseEvent>();

  const hostRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);

  const interactionRef = useRef(new InteractionHandler());

  useEffect(() => {
    const interaction = interactionRef.current;
    const host = hostRef.current!;
    const world = worldRef.current!;

    interaction
      .transformChange((transform: string) => {
        world.style.transform = transform;
      })
      .setHost(host)
      .init()
      .listen(
        {
          key: "pan",
          selectDone: (v) => {
            setPan(v as Coords);
          },
        },
        {
          key: "zoom",
          selectDone: (v) => {
            setZoom(v as number);
          },
        }
      );

    return () => {
      interaction.done();
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
      // onWheel={(e) => {
      //   const factor = e.deltaY < 0 ? 1.1 : 0.9;
      //   zoomAt(e.clientX, e.clientY, factor);
      // }}
      className={"w-full h-full overflow-hidden relative " + classes}
    >
      <span ref={worldRef} className="absolute">
        <World />
      </span>
    </div>
  );
}
