import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";
import { patientLoad } from "@/utils/workspace/patient-load";
import {
  clientPointToContent,
  elementCenterToContent,
} from "@/utils/workspace/viewport";
import type { Point } from "@/utils/workspace/connection-path";

export interface Connection {
  id: string;
  from: Point;
  to: Point;
}

interface Attempt {
  nodeId: string;
  from: Point;
  to: Point;
}

interface ConnectionsContextValue {
  connections: Connection[];
  attempt: Attempt | null;
  /** Content-space point for a terminal element's current center. */
  terminalContentPoint: (el: HTMLElement) => Point | null;
  /** Content-space point for a raw mouse event's client coordinates. */
  clientContentPoint: (clientX: number, clientY: number) => Point | null;
  beginAttempt: (nodeId: string, from: Point) => void;
  updateAttempt: (to: Point) => void;
  /** Commits the in-progress attempt as a connection ending at `to`, then clears it. */
  commitAttempt: (to: Point) => void;
  /** Discards the in-progress attempt without creating a connection. */
  cancelAttempt: () => void;
}

const ConnectionsContext = createContext<ConnectionsContextValue | null>(
  null,
);

let nextConnectionId = 0;

export function ConnectionsProvider({ children }: { children: ReactNode }) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [attempt, setAttempt] = useState<Attempt | null>(null);

  // fetched once via patientLoad, then read synchronously on every drag
  // event rather than re-subscribing per read
  const hostRef = useRef<HTMLElement | null>(null);
  const cameraRef = useRef<ReactZoomPanPinchContentRef | null>(null);

  useEffect(() => {
    patientLoad.getSource<HTMLElement>("viewportHost", (host) => {
      hostRef.current = host;
    });
    patientLoad.getSource<ReactZoomPanPinchContentRef>("camera", (camera) => {
      cameraRef.current = camera;
    });
  }, []);

  const withHostAndScale = useCallback(
    <T,>(fn: (host: HTMLElement, state: ReactZoomPanPinchContentRef["instance"]["transformState"]) => T): T | null => {
      const host = hostRef.current;
      const camera = cameraRef.current;

      if (!host || !camera) {
        return null;
      }

      return fn(host, camera.instance.transformState);
    },
    [],
  );

  const terminalContentPoint = useCallback(
    (el: HTMLElement) =>
      withHostAndScale((host, state) => elementCenterToContent(el, host, state)),
    [withHostAndScale],
  );

  const clientContentPoint = useCallback(
    (clientX: number, clientY: number) =>
      withHostAndScale((host, state) =>
        clientPointToContent(clientX, clientY, host, state),
      ),
    [withHostAndScale],
  );

  const beginAttempt = useCallback((nodeId: string, from: Point) => {
    setAttempt({ nodeId, from, to: from });
  }, []);

  const updateAttempt = useCallback((to: Point) => {
    setAttempt((current) => (current ? { ...current, to } : current));
  }, []);

  const commitAttempt = useCallback((to: Point) => {
    setAttempt((current) => {
      if (current) {
        setConnections((conns) => [
          ...conns,
          { id: `connection-${nextConnectionId++}`, from: current.from, to },
        ]);
      }
      return null;
    });
  }, []);

  const cancelAttempt = useCallback(() => {
    setAttempt(null);
  }, []);

  const value = useMemo<ConnectionsContextValue>(
    () => ({
      connections,
      attempt,
      terminalContentPoint,
      clientContentPoint,
      beginAttempt,
      updateAttempt,
      commitAttempt,
      cancelAttempt,
    }),
    [
      connections,
      attempt,
      terminalContentPoint,
      clientContentPoint,
      beginAttempt,
      updateAttempt,
      commitAttempt,
      cancelAttempt,
    ],
  );

  return (
    <ConnectionsContext.Provider value={value}>
      {children}
    </ConnectionsContext.Provider>
  );
}

export function useConnections(): ConnectionsContextValue {
  const ctx = useContext(ConnectionsContext);

  if (!ctx) {
    throw new Error("useConnections must be used within a ConnectionsProvider");
  }

  return ctx;
}
