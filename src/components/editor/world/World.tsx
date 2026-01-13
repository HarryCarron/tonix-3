import { ENV } from "@/env";
import "./World.css";
import { NodeWrapper } from "@/components/nodes/node-wrapper/NodeWrapper";
import { Polysynth } from "@/components/instruments/polysynth/Polysynth";
import Keyboard from "@/components/nodes/keyboard/Keyboard";

export function World() {
  return (
    <div
      className="world"
      style={{
        height: ENV.worldDims + "px",
        width: ENV.worldDims + "px",
      }}
    >
      <span className="absolute" style={{ left: "300px", top: "300px" }}>
        <NodeWrapper>
          <Polysynth />
        </NodeWrapper>
      </span>

      <span className="absolute" style={{ left: "800px", top: "400px" }}>
        <NodeWrapper>
          <Keyboard />
        </NodeWrapper>
      </span>
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
