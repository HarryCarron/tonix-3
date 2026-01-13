import "./Workspace.css";
import { EditorTool } from "@/types/editor/EditorTools";
import { useEffect } from "react";
import { World } from "../world/World";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ENV } from "@/env";

interface WorkspaceProps {
  editorTool: EditorTool;
}

export function Workspace({ editorTool }: WorkspaceProps) {
  const classes = "";

  return (
    <div className={"w-full h-full " + classes}>
      <TransformWrapper
        minScale={0.3}
        maxScale={1}
        wheel={{ smoothStep: 0.001, step: 0.2 }}
      >
        <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
          <World />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
