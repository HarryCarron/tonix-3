import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";
import { Terminal } from "./Terminal";
import {
  ConnectionsProvider,
  useConnections,
} from "@/context/connections/ConnectionsContext";
import { patientLoad } from "@/utils/workspace/patient-load";

function ConnectionsProbe() {
  const { attempt, connections } = useConnections();
  return (
    <pre data-testid="probe">
      {JSON.stringify({ attempt, connections: connections.length })}
    </pre>
  );
}

function mouseEvent(type: string, x: number, y: number) {
  return new MouseEvent(type, { bubbles: true, clientX: x, clientY: y });
}

function renderTwoTerminals() {
  return render(
    <ConnectionsProvider>
      <Terminal nodeId="a" side="output" />
      <Terminal nodeId="b" side="input" />
      <ConnectionsProbe />
    </ConnectionsProvider>,
  );
}

function probeState() {
  return JSON.parse(screen.getByTestId("probe").textContent!);
}

const identityCamera = {
  instance: { transformState: { scale: 1, positionX: 0, positionY: 0 } },
} as unknown as ReactZoomPanPinchContentRef;

describe("Terminal drag-to-connect", () => {
  beforeEach(() => {
    patientLoad.setSource("viewportHost", document.body);
    patientLoad.setSource("camera", identityCamera);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // @ts-expect-error test cleanup of a jsdom-unimplemented method
    delete document.elementFromPoint;
  });

  it("commits a connection when released over another node's input terminal", () => {
    const { container } = renderTwoTerminals();
    const output = container.querySelector('[data-terminal-side="output"]')!;
    const input = container.querySelector('[data-terminal-side="input"]')!;

    document.elementFromPoint = vi.fn().mockReturnValue(input);

    act(() => output.dispatchEvent(mouseEvent("mousedown", 0, 0)));
    expect(probeState().attempt).not.toBeNull();

    act(() => document.dispatchEvent(mouseEvent("mousemove", 50, 50)));
    act(() => document.dispatchEvent(mouseEvent("mouseup", 10, 10)));

    const state = probeState();
    expect(state.attempt).toBeNull();
    expect(state.connections).toBe(1);
  });

  it("cancels the attempt when released over empty space", () => {
    const { container } = renderTwoTerminals();
    const output = container.querySelector('[data-terminal-side="output"]')!;

    document.elementFromPoint = vi.fn().mockReturnValue(null);

    act(() => output.dispatchEvent(mouseEvent("mousedown", 0, 0)));
    act(() => document.dispatchEvent(mouseEvent("mouseup", 10, 10)));

    const state = probeState();
    expect(state.attempt).toBeNull();
    expect(state.connections).toBe(0);
  });

  it("cancels the attempt when released back over its own node", () => {
    const { container } = renderTwoTerminals();
    const output = container.querySelector('[data-terminal-side="output"]')!;

    // an input terminal belonging to the same node id ("a")
    const ownInput = document.createElement("div");
    ownInput.dataset.nodeId = "a";
    ownInput.dataset.terminalSide = "input";
    document.body.appendChild(ownInput);
    document.elementFromPoint = vi.fn().mockReturnValue(ownInput);

    act(() => output.dispatchEvent(mouseEvent("mousedown", 0, 0)));
    act(() => document.dispatchEvent(mouseEvent("mouseup", 10, 10)));

    const state = probeState();
    expect(state.attempt).toBeNull();
    expect(state.connections).toBe(0);
  });

  it("does not start a drag from an input terminal", () => {
    const { container } = renderTwoTerminals();
    const input = container.querySelector('[data-terminal-side="input"]')!;

    act(() => input.dispatchEvent(mouseEvent("mousedown", 0, 0)));

    expect(probeState().attempt).toBeNull();
  });
});
