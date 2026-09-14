import { HiOutlineX } from "react-icons/hi";
import { HiAdjustments } from "react-icons/hi";
import "./NodeWrapper.css";
import { Button } from "@/components/ui/button";
import { HiOutlineVolumeOff } from "react-icons/hi";
import { TbGripVertical } from "react-icons/tb";
import { useEffect, useRef, type ReactNode } from "react";
import type { ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";
import { Terminal } from "./Terminal";
import { DragAndDrop } from "@/utils/drag-and-drop";
import { patientLoad } from "@/utils/workspace/patient-load";

interface NodeWrapperProps {
  id: string;
  children: ReactNode;
  /**
   * Content-space delta since the last tick, coalesced to one call per
   * frame. Optional since outside `World.tsx` (e.g. Storybook) there's no
   * position state to update - the grip still drags, it just doesn't go
   * anywhere, same as a terminal drag is inert without a registered camera.
   */
  onDrag?: (id: string, dx: number, dy: number) => void;
}

export function NodeWrapper({ id, children, onDrag }: NodeWrapperProps) {
  const gripHostRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<ReactZoomPanPinchContentRef | null>(null);

  useEffect(() => {
    patientLoad.getSource<ReactZoomPanPinchContentRef>("camera", (camera) => {
      cameraRef.current = camera;
    });
  }, []);

  // Coalesced to rAF, same as knob drags - a setState per mousemove here
  // stalled audio the same way raw-per-tick PolySynth.set() calls did.
  useEffect(() => {
    const host = gripHostRef.current!;
    const dd = new DragAndDrop().setHost(host);

    let last: { x: number; y: number } | null = null;
    let rafId: number | null = null;
    let pendingDx = 0;
    let pendingDy = 0;

    const flush = () => {
      rafId = null;
      if (pendingDx !== 0 || pendingDy !== 0) {
        onDrag?.(id, pendingDx, pendingDy);
        pendingDx = 0;
        pendingDy = 0;
      }
    };

    dd.listen(({ type, e }) => {
      if (type === "start") {
        last = { x: e.clientX, y: e.clientY };
        return;
      }

      if (type === "dragging") {
        if (!last) return;

        const scale = cameraRef.current?.instance.transformState.scale ?? 1;
        pendingDx += (e.clientX - last.x) / scale;
        pendingDy += (e.clientY - last.y) / scale;
        last = { x: e.clientX, y: e.clientY };

        if (rafId === null) {
          rafId = requestAnimationFrame(flush);
        }
        return;
      }

      // "done"
      last = null;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        flush();
      }
    });

    return () => {
      dd.done();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [id, onDrag]);

  return (
    <div className="inline-flex items-center gap-1">
      <Terminal nodeId={id} side="input" />

      <div className="node-wrapper inline-flex flex-col">
        <div className="title-container h-12 w-full flex items-center gap-[2px]">
          <div className="flex items-center justify-center" ref={gripHostRef}>
            <Button
              variant="outline"
              size="icon"
              className="cursor-grab active:cursor-grabbing"
            >
              <TbGripVertical />
            </Button>
          </div>
          <div className="grow" />
          <span className="flex gap-[2px]">
            <div className="flex items-center justify-center">
              <Button variant="outline" size="icon">
                <HiOutlineVolumeOff />
              </Button>
            </div>
            <div className="flex items-center justify-center">
              <Button variant="outline" size="icon">
                <HiAdjustments />
              </Button>
            </div>
            <div className="flex items-center justify-center">
              <Button variant="outline" size="icon">
                <HiOutlineX />
              </Button>
            </div>
          </span>
        </div>
        <div className="node-container">{children}</div>
      </div>

      <Terminal nodeId={id} side="output" />
    </div>
  );
}
