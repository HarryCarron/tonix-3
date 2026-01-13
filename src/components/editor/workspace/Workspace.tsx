import "./Workspace.css";
import { EditorTool } from "@/types/editor/EditorTools";
import { World } from "../world/World";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Tools from "../tools/Tools";
import { useState } from "react";

export function Workspace() {
  const [editorTool, setEditorTool] = useState<EditorTool | undefined>();

  let classes = "";

  if (editorTool === EditorTool.pan) {
    classes = "cursor-grab";
  }

  if (editorTool === EditorTool.mag) {
    classes += "cursor-crosshair";
  }

  return (
    <div className={"w-full h-full relative " + classes}>
      <TransformWrapper
        panning={{ disabled: editorTool !== EditorTool.pan }}
        minScale={0.3}
        maxScale={1}
        wheel={{ smoothStep: 0.001, step: 0.2 }}
      >
        <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
          <World />
        </TransformComponent>
      </TransformWrapper>

      <div className="absolute tools flex justify-items-center align-items-center m-2">
        <Tools editorTool={editorTool!} setEditorTool={setEditorTool} />
      </div>
    </div>
  );
}
