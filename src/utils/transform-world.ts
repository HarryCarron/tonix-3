import type { Coords } from "@/types/global/Coords";
import type { ZoomChange } from "./zoom-handler";

export interface TransformWorldPayload {
  transform: string;
  pan: Coords;
}

export function transformWorld(pan: Coords, zoomChange: ZoomChange): string {
  const [, zoom] = zoomChange!;

  return `translate(${pan!.x}px, ${pan!.y * zoom}px)scale(${zoom})`;
}
