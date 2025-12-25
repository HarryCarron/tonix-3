import { useState, useCallback } from "react";

export function useViewport(initialZoom = 1, initialPan = { x: 0, y: 0 }) {
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState(initialPan);

  const screenToWorld = useCallback(
    (x: number, y: number) => ({
      x: (x - pan.x) / zoom,
      y: (y - pan.y) / zoom,
    }),
    [zoom, pan]
  );

  const worldToScreen = useCallback(
    (x: number, y: number) => ({
      x: x * zoom + pan.x,
      y: y * zoom + pan.y,
    }),
    [zoom, pan]
  );

  const zoomAt = useCallback(
    (screenX: number, screenY: number, factor: number) => {
      const world = screenToWorld(screenX, screenY);
      const newZoom = zoom * factor;

      setZoom(newZoom);
      setPan({
        x: screenX - world.x * newZoom,
        y: screenY - world.y * newZoom,
      });
    },
    [zoom, screenToWorld]
  );

  return { zoom, pan, setZoom, setPan, screenToWorld, worldToScreen, zoomAt };
}
