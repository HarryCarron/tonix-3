import { useCallback, useState } from "react";
import { ENV } from "@/env";
import "./World.css";
import { NodeWrapper } from "@/components/nodes/node-wrapper/NodeWrapper";
import { NodeMap } from "@/utils/node-map";
import { WorldBackground } from "./WorldBackground";
import { ConnectionsProvider } from "@/context/connections/ConnectionsContext";
import { Connections } from "./Connections";

interface WorldNode {
  id: string;
  type: keyof typeof NodeMap;
  // Per-node canvas position - the piece of patch state this file owns.
  // Camera pan/zoom (the other half of a persistable "patch" - see
  // CLAUDE.md's State management note) lives separately in
  // react-zoom-pan-pinch's own instance state; the two aren't unified yet,
  // but both are plain serializable data so a future save/load layer can
  // read this alongside `transformRef.current.instance.transformState`.
  position: { left: number; top: number };
}

// Polysynth (tall) on the left; the 4 shorter nodes in a 2x2 grid beside
// it, sized off each node's measured rendered footprint plus a fixed gap -
// keeps the whole layout inside the default (unscaled, unpanned) viewport
const INITIAL_NODES: WorldNode[] = [
  { id: "polysynth-1", type: "polysynth", position: { left: 150, top: 150 } },
  { id: "midiBox-1", type: "midiBox", position: { left: 500, top: 150 } },
  { id: "keyboard-1", type: "keyboard", position: { left: 810, top: 150 } },
  { id: "filter-1", type: "filter", position: { left: 500, top: 353 } },
  { id: "delay-1", type: "delay", position: { left: 810, top: 353 } },
];

export function World() {
  const [nodes, setNodes] = useState<WorldNode[]>(INITIAL_NODES);

  const handleNodeDrag = useCallback((id: string, dx: number, dy: number) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id
          ? {
              ...node,
              position: {
                left: node.position.left + dx,
                top: node.position.top + dy,
              },
            }
          : node
      )
    );
  }, []);

  return (
    <div
      className="world border border-stone-300"
      style={{
        height: ENV.worldDims + "px",
        width: ENV.worldDims + "px",
      }}
    >
      <WorldBackground
        width={ENV.worldDims + "px"}
        height={ENV.worldDims + "px"}
      />
      <ConnectionsProvider>
        {nodes.map(({ id, type, position }) => {
          const NodeComponent = NodeMap[type];

          return (
            <span
              key={id}
              className="absolute"
              style={{ left: position.left + "px", top: position.top + "px" }}
            >
              <NodeWrapper id={id} onDrag={handleNodeDrag}>
                <NodeComponent />
              </NodeWrapper>
            </span>
          );
        })}
        <Connections />
      </ConnectionsProvider>
    </div>
  );
}
