import type { MouseEvent } from "react";
import type { StageInteraction } from "./types";

const STAGE_IDS = [0, 1, 2, 3];

interface AmpInteractionLayerProps {
  width: number;
  height: number;
  get: (id: number) => StageInteraction;
  onStageClick: (id: number) => void;
  onHandleDrag: (e: MouseEvent<SVGCircleElement>, id: number) => void;
}

export function AmpInteractionLayer({
  width,
  height,
  get,
  onStageClick,
  onHandleDrag,
}: AmpInteractionLayerProps) {
  return (
    <svg className="interaction-layer absolute top-0 left-0" height={height} width={width}>
      {STAGE_IDS.map((id) => (
        <InteractionRect
          key={id}
          stage={get(id)}
          height={height}
          onClick={() => onStageClick(id)}
        />
      ))}
      {STAGE_IDS.map((id) => (
        <InteractionHandle
          key={id}
          stage={get(id)}
          onDrag={(e) => onHandleDrag(e, id)}
        />
      ))}
    </svg>
  );
}

function InteractionRect({
  stage: { x, width },
  height,
  onClick,
}: {
  stage: StageInteraction;
  height: number;
  onClick: (e: MouseEvent<SVGRectElement>) => void;
}) {
  return (
    <rect
      onClick={onClick}
      x={x}
      width={width}
      y="0"
      height={height}
      fill="transparent"
      stroke="none"
      className="cursor-pointer"
    />
  );
}

function InteractionHandle({
  stage: {
    handle: { x, y },
  },
  onDrag,
}: {
  stage: StageInteraction;
  onDrag: (e: MouseEvent<SVGCircleElement>) => void;
}) {
  return (
    <circle
      onMouseDown={onDrag}
      cx={x}
      cy={y}
      r="5"
      fill="transparent"
      stroke="none"
      className="cursor-grab active:cursor-grabbing"
    />
  );
}
