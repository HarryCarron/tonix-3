import type { MouseEvent } from "react";

interface FilterInteractionLayerProps {
  width: number;
  height: number;
  handleX: number;
  handleY: number;
  onDragStart: (e: MouseEvent<SVGRectElement | SVGCircleElement>) => void;
}

export function FilterInteractionLayer({
  width,
  height,
  handleX,
  handleY,
  onDragStart,
}: FilterInteractionLayerProps) {
  return (
    <svg className="interaction-layer absolute" width={width} height={height}>
      <rect
        width={width}
        height={height}
        fill="transparent"
        stroke="none"
        className="cursor-pointer"
        onMouseDown={onDragStart}
      />
      <circle
        cx={handleX}
        cy={handleY}
        fill="transparent"
        stroke="none"
        r="5"
        className="cursor-pointer"
        onMouseDown={onDragStart}
      />
    </svg>
  );
}
