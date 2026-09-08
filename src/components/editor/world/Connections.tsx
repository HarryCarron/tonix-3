import { ENV } from "@/env";
import { useConnections } from "@/context/connections/ConnectionsContext";
import { describeConnectionPath } from "@/utils/workspace/connection-path";

/**
 * SVG overlay drawing every committed connection plus the in-progress
 * drag-to-connect attempt, if any. Lives inside `World` so it shares its
 * content-space coordinate system and moves with pan/zoom for free.
 */
export function Connections() {
  const { connections, attempt } = useConnections();

  return (
    <svg
      width={ENV.worldDims + "px"}
      height={ENV.worldDims + "px"}
      className="absolute inset-0 pointer-events-none"
    >
      {connections.map((connection) => (
        <path
          key={connection.id}
          d={describeConnectionPath(connection.from, connection.to)}
          stroke="rgb(87 83 78 / 0.6)"
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
        />
      ))}

      {attempt && (
        <path
          d={describeConnectionPath(attempt.from, attempt.to)}
          stroke="rgb(87 83 78 / 0.35)"
          strokeWidth={2}
          strokeDasharray="4 3"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </svg>
  );
}
