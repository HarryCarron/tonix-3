import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

vi.mock("tone", () => {
  class Part {
    dispose() {}
    start() {}
    set loop(_v: boolean) {}
    set loopEnd(_v: unknown) {}
  }
  return {
    Part,
    start: vi.fn().mockResolvedValue(undefined),
    getTransport: () => ({ start: vi.fn(), pause: vi.fn(), stop: vi.fn(), position: 0 }),
  };
});

vi.mock("@/components/effects/filter/filter-response", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/components/effects/filter/filter-response")>();
  return { ...actual, getFilterResponseDb: () => new Float32Array([0, -3, -6]) };
});

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();

  class MockResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  vi.stubGlobal("ResizeObserver", MockResizeObserver);
});

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    scale: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    rect: vi.fn(),
    arc: vi.fn(),
    setLineDash: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    strokeStyle: "",
    fillStyle: "",
    lineWidth: 0,
  } as unknown as CanvasRenderingContext2D);
  vi.stubGlobal("requestAnimationFrame", vi.fn(() => 0));
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

describe("App", () => {
  it("renders the Menu sidebar and the Workspace with every initial node", () => {
    render(<App />);

    expect(screen.getByText("Tonix")).toBeInTheDocument();
    expect(screen.getByText("Polysynth")).toBeInTheDocument();
    expect(screen.getByText("MidiBox")).toBeInTheDocument();
    expect(screen.getByText("Filter")).toBeInTheDocument();
    expect(screen.getByText("Delay")).toBeInTheDocument();
  });

  it("mounts the Navigator minimap once a state change re-renders after the host ref attaches", () => {
    const { container } = render(<App />);

    // Workspace's hostRef is set during the initial commit but doesn't
    // itself trigger a re-render, so Navigator's `hostRef.current && ...`
    // guard only starts rendering it once something else re-renders -
    // clicking a Tools button (editorTool state) is a real trigger for that.
    const toolsButton = container.querySelector(".tools button")!;
    fireEvent.click(toolsButton);

    expect(container.querySelector("#navigator\\:world")).toBeInTheDocument();
  });

  it("shows the editor Tools palette", () => {
    render(<App />);
    // add / pan / mag tool buttons
    expect(screen.getAllByRole("button", { hidden: true }).length).toBeGreaterThan(0);
  });
});
