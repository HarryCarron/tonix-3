import "./Workspace.css";
import { EditorTool } from "@/types/editor/EditorTools";
import { World } from "../world/World";
import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchContentRef,
} from "react-zoom-pan-pinch";
import Tools from "../tools/Tools";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BoundingBoxTool,
  type Rect,
} from "@/utils/workspace/bounding-box-tool";
import Navigator from "../navigator/Navigator";
import { patientLoad } from "@/utils/workspace/patient-load";

export function Workspace() {
  const [editorTool, setEditorTool] = useState<EditorTool | undefined>();

  const hostRef = useRef<HTMLDivElement | null>(null);

  const transformRef = useRef<ReactZoomPanPinchContentRef | null>(null);

  const boundingBoxRef = useRef<BoundingBoxTool>(new BoundingBoxTool());

  let classes = "";

  useEffect(() => {
    patientLoad.setSource("camera", transformRef.current);
  }, []);

  useEffect(() => {
    const bbox = boundingBoxRef.current!;
    const host = hostRef.current!;

    if (editorTool === EditorTool.mag) {
      bbox.setHost(host).listen((rect: Rect) => {});
    }

    return () => {
      bbox.done?.();
    };
  }, [editorTool]);

  if (editorTool === EditorTool.pan) {
    classes = "cursor-grab";
  }

  if (editorTool === EditorTool.mag) {
    classes += "cursor-crosshair";
  }

  return (
    <div className={"w-full h-full relative " + classes}>
      <div className="w-full h-full relative" ref={hostRef}>
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
      </div>

      <div className="absolute tools flex justify-items-center align-items-center m-2">
        <Tools editorTool={editorTool!} setEditorTool={setEditorTool} />
      </div>

      {hostRef.current && (
        <div className="absolute navigator flex justify-items-center align-items-center m-2">
          <Navigator host={hostRef.current} />
        </div>
      )}
    </div>
  );
}
