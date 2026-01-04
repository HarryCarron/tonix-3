import "./Workspace.css";
import { EditorTool } from "@/types/editor/EditorTools";
import React, { useEffect, useRef, useState } from "react";
import { World } from "../world/World";
import { PanStateHandlers } from "./state-handlers/pan";
import {
  InteractionHandler,
  type HandlerMap,
} from "@/utils/interaction-handler";
import type { Coords } from "@/types/global/Coords";

interface WorkspaceProps {
  editorTool: EditorTool;
}

export function Workspace({ editorTool }: WorkspaceProps) {
  const [, setPan] = useState<Coords | undefined>();
  const [, setZoom] = useState<number | undefined>();
  const [mouseEvent] = useState<React.MouseEvent>();

  const hostRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);

  const interactionRef = useRef(new InteractionHandler());

  function _prepareTransform(handlerMap: HandlerMap): string {
    const { pan: pHandler, zoom: zHandler } = handlerMap;

    const pan = pHandler.value as Coords;
    const zoom = zHandler.value as number;

    return `translate(${pan.x * zoom}px, ${pan.y * zoom}px) scale(${zoom})`;
  }

  useEffect(() => {
    const interaction = interactionRef.current;
    const host = hostRef.current!;
    const world = worldRef.current!;

    interaction
      .onChange((handlers: HandlerMap) => {
        world.style.transform = _prepareTransform(handlers);
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
      interaction.destroy();
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
      className={"w-full h-full overflow-hidden relative " + classes}
    >
      <span ref={worldRef} className="absolute">
        <World />
      </span>
    </div>
  );
}
