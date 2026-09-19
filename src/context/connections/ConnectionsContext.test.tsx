import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import type { ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";
import { ConnectionsProvider, useConnections } from "./ConnectionsContext";
import { patientLoad } from "@/utils/workspace/patient-load";

function rectFor(left: number, top: number, width = 0, height = 0) {
  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
    x: left,
    y: top,
    toJSON() {},
  } as DOMRect;
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <ConnectionsProvider>{children}</ConnectionsProvider>
);

describe("useConnections", () => {
  it("throws when used outside a ConnectionsProvider", () => {
    expect(() => renderHook(() => useConnections())).toThrow(
      "useConnections must be used within a ConnectionsProvider",
    );
  });

  it("starts with no connections and no in-progress attempt", () => {
    const { result } = renderHook(() => useConnections(), { wrapper });
    expect(result.current.connections).toEqual([]);
    expect(result.current.attempt).toBeNull();
  });

  it("returns null content points before the host/camera sources are available", () => {
    const { result } = renderHook(() => useConnections(), { wrapper });

    expect(result.current.clientContentPoint(10, 10)).toBeNull();
    expect(result.current.terminalContentPoint(document.createElement("div"))).toBeNull();
  });

  it("tracks begin/update/cancel of a connection attempt", () => {
    const { result } = renderHook(() => useConnections(), { wrapper });

    act(() => result.current.beginAttempt("node-1", { x: 0, y: 0 }));
    expect(result.current.attempt).toEqual({
      nodeId: "node-1",
      from: { x: 0, y: 0 },
      to: { x: 0, y: 0 },
    });

    act(() => result.current.updateAttempt({ x: 5, y: 5 }));
    expect(result.current.attempt).toEqual({
      nodeId: "node-1",
      from: { x: 0, y: 0 },
      to: { x: 5, y: 5 },
    });

    act(() => result.current.cancelAttempt());
    expect(result.current.attempt).toBeNull();
    expect(result.current.connections).toEqual([]);
  });

  it("commits the in-progress attempt as a new connection", () => {
    const { result } = renderHook(() => useConnections(), { wrapper });

    act(() => result.current.beginAttempt("node-1", { x: 0, y: 0 }));
    act(() => result.current.commitAttempt({ x: 10, y: 20 }));

    expect(result.current.attempt).toBeNull();
    expect(result.current.connections).toHaveLength(1);
    expect(result.current.connections[0]).toMatchObject({
      from: { x: 0, y: 0 },
      to: { x: 10, y: 20 },
    });
  });

  it("does nothing on commitAttempt when there is no in-progress attempt", () => {
    const { result } = renderHook(() => useConnections(), { wrapper });

    act(() => result.current.commitAttempt({ x: 10, y: 20 }));

    expect(result.current.connections).toEqual([]);
  });

  it("converts client/element coordinates via the registered host and camera", () => {
    const host = document.createElement("div");
    vi.spyOn(host, "getBoundingClientRect").mockReturnValue(rectFor(100, 50));

    const camera = {
      instance: { transformState: { scale: 2, positionX: 0, positionY: 0 } },
    } as unknown as ReactZoomPanPinchContentRef;

    patientLoad.setSource("viewportHost", host);
    patientLoad.setSource("camera", camera);

    const { result } = renderHook(() => useConnections(), { wrapper });

    expect(result.current.clientContentPoint(120, 70)).toEqual({ x: 10, y: 10 });

    const el = document.createElement("div");
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue(rectFor(140, 90, 20, 20));
    expect(result.current.terminalContentPoint(el)).toEqual({ x: 25, y: 25 });
  });
});
