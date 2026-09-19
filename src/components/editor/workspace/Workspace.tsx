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
import { clientPointToContent } from "@/utils/workspace/viewport";

export function Workspace() {
  const [editorTool, setEditorTool] = useState<EditorTool | undefined>();

  const hostRef = useRef<HTMLDivElement | null>(null);

  const magOverlayRef = useRef<HTMLDivElement | null>(null);

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
      // TransformWrapper's own mousedown handler calls stopPropagation()
      // on every mousedown inside it regardless of `panning.disabled`, so
      // a listener on `host` (an ancestor of the wrapper) never sees the
      // event. The overlay sits on top of the wrapper and outside it in
      // the DOM, so it gets the mousedown first and the wrapper never
      // sees it at all.
      const overlay = magOverlayRef.current!;
      bbox.setHost(overlay).listen((rect) => {
        const camera = transformRef.current;
        if (!camera || rect.w === 0 || rect.h === 0) return;

        const state = camera.instance.transformState;
        const topLeft = clientPointToContent(rect.x, rect.y, host, state);
        const bottomRight = clientPointToContent(
          rect.x + rect.w,
          rect.y + rect.h,
          host,
          state
        );
        const contentW = bottomRight.x - topLeft.x;
        const contentH = bottomRight.y - topLeft.y;

        const { width: hostW, height: hostH } = host.getBoundingClientRect();
        const targetScale = Math.min(hostW / contentW, hostH / contentH);
        const newScale = Math.min(Math.max(targetScale, minScale), 1);

        const centerX = topLeft.x + contentW / 2;
        const centerY = topLeft.y + contentH / 2;
        const newPositionX = hostW / 2 - centerX * newScale;
        const newPositionY = hostH / 2 - centerY * newScale;

        camera.setTransform(newPositionX, newPositionY, newScale, 200, "easeOut");
      });
    }

    return () => {
      bbox.done?.();
    };
  }, [editorTool, minScale]);

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

      {editorTool === EditorTool.mag && (
        <div className="absolute inset-0" ref={magOverlayRef} />
      )}

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
