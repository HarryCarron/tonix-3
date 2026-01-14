import "./Workspace.css";
import { EditorTool } from "@/types/editor/EditorTools";
import { World } from "../world/World";
import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchContentRef,
} from "react-zoom-pan-pinch";
import Tools from "../tools/Tools";
import { useEffect, useRef, useState } from "react";
import { MagZoom } from "@/utils/workspace/mag-zoom";

export function Workspace() {
  const [editorTool, setEditorTool] = useState<EditorTool | undefined>();

  const hostRef = useRef<HTMLDivElement | null>(null);

  const transformRef = useRef<ReactZoomPanPinchContentRef | null>(null);

  const magZoomRef = useRef<MagZoom>(new MagZoom());

  let classes = "";

  useEffect(() => {
    const mag = magZoomRef.current!;
    const host = hostRef.current!;
    const transform = transformRef.current!;

    if (editorTool === EditorTool.mag) {
      mag.setHost(host).listen(([a, b]) => {
        transform.setTransform();
      });
    }

    return () => {
      mag.done?.();
    };
  }, [editorTool]);

  if (editorTool === EditorTool.pan) {
    classes = "cursor-grab";
  }

  if (editorTool === EditorTool.mag) {
    classes += "cursor-crosshair";
  }

  return (
    <div className={"w-full h-full relative " + classes} ref={hostRef}>
      <TransformWrapper
        panning={{ disabled: editorTool !== EditorTool.pan }}
        minScale={0.3}
        maxScale={1}
        wheel={{ smoothStep: 0.001, step: 0.2 }}
        ref={transformRef}
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
