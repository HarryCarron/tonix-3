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
import { BoundingBoxTool } from "@/utils/workspace/bounding-box-tool";
import Navigator from "../navigator/Navigator";
import { patientLoad } from "@/utils/workspace/patient-load";
import { ENV } from "@/env";

export function Workspace() {
  const [editorTool, setEditorTool] = useState<EditorTool | undefined>();

  const hostRef = useRef<HTMLDivElement | null>(null);

  const transformRef = useRef<ReactZoomPanPinchContentRef | null>(null);

  const boundingBoxRef = useRef<BoundingBoxTool>(new BoundingBoxTool());

  // Bounds the wrapper's `limitToBounds` clamps against collapse to a
  // single point on any axis where the scaled world is smaller than the
  // container (react-zoom-pan-pinch's getBounds), which both shows
  // whitespace around the world and makes that axis un-pannable. Deriving
  // minScale from the real container size (rather than a fixed guess)
  // guarantees the world always covers the viewport at min zoom.
  const [minScale, setMinScale] = useState(1);

  let classes = "";

  useEffect(() => {
    patientLoad.setSource("camera", transformRef.current);
    patientLoad.setSource("viewportHost", hostRef.current);
  }, []);

  useEffect(() => {
    const host = hostRef.current!;

    const updateMinScale = () => {
      const { width, height } = host.getBoundingClientRect();
      const coverScale = Math.max(width, height) / ENV.worldDims;
      setMinScale(Math.min(coverScale, 1));
    };

    updateMinScale();

    const observer = new ResizeObserver(updateMinScale);
    observer.observe(host);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const bbox = boundingBoxRef.current!;
    const host = hostRef.current!;

    if (editorTool === EditorTool.mag) {
      // listener intentionally not implemented yet — tracked as part of the
      // mouse-anchored-zoom refactor (see CLAUDE.md's Coordinate model note)
      bbox.setHost(host).listen(() => {});
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
      <div className="w-full h-full relative bg-stone-100" ref={hostRef}>
        <TransformWrapper
          panning={{
            disabled: editorTool !== EditorTool.pan,
            velocityDisabled: true,
          }}
          minScale={minScale}
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
