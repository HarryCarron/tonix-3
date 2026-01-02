import { ENV } from "@/env";
import "./World.css";

interface WorldProps {
  pan: {
    x: number;
    y: number;
  };
  zoom: number;
}

export function World() {
  return (
    <div
      className="world"
      style={{
        height: "3000px",
        width: "3000px",
        // transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
      }}
    >
      <Background />
    </div>
  );
}

function Background() {
  return (
    <svg
      width={ENV.worldDims + "px"}
      height={ENV.worldDims + "px"}
      className="inset-0 pointer-events-none"
    >
      <pattern
        id="pattern-circles"
        x="0"
        y="0"
        width="50"
        height="50"
        patternUnits="userSpaceOnUse"
        patternContentUnits="userSpaceOnUse"
      >
        <circle
          id="pattern-circle"
          cx="10"
          cy="10"
          r="1.6257413380501518"
          fill="#cbcbcbff"
        ></circle>
      </pattern>

      <rect
        id="rect"
        x="0"
        y="0"
        width={ENV.worldDims + "px"}
        height={ENV.worldDims + "px"}
        fill="url(#pattern-circles)"
      ></rect>
    </svg>
  );
}
