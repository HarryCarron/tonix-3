import { ENV } from "@/env";
import "./World.css";
import { NodeWrapper } from "@/components/nodes/node-wrapper/NodeWrapper";
import { NodeMap } from "@/utils/node-map";

interface WorldNode {
  id: string;
  type: keyof typeof NodeMap;
  position: { left: number; top: number };
}

// initial node layout, replacing what used to be hardcoded JSX per node;
// positions preserved from that previous layout
const INITIAL_NODES: WorldNode[] = [
  { id: "polysynth-1", type: "polysynth", position: { left: 300, top: 300 } },
  { id: "keyboard-1", type: "keyboard", position: { left: 800, top: 400 } },
  { id: "midiBox-1", type: "midiBox", position: { left: 550, top: 150 } },
  { id: "filter-1", type: "filter", position: { left: 300, top: 650 } },
  { id: "delay-1", type: "delay", position: { left: 900, top: 750 } },
];

export function World() {
  return (
    <div
      className="world"
      style={{
        height: ENV.worldDims + "px",
        width: ENV.worldDims + "px",
      }}
    >
      {INITIAL_NODES.map(({ id, type, position }) => {
        const NodeComponent = NodeMap[type];

        return (
          <span
            key={id}
            className="absolute"
            style={{ left: position.left + "px", top: position.top + "px" }}
          >
            <NodeWrapper>
              <NodeComponent />
            </NodeWrapper>
          </span>
        );
      })}
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
