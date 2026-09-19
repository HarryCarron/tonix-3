import { render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { World } from "./World";

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

describe("World", () => {
  it("renders every initial node, each with an input and output terminal", () => {
    const { container } = render(<World />);

    expect(container.querySelector(".world")).toBeInTheDocument();
    expect(screen.getByText("Polysynth")).toBeInTheDocument();
    expect(screen.getByText("MidiBox")).toBeInTheDocument();
    expect(screen.getByText("Filter")).toBeInTheDocument();
    expect(screen.getByText("Delay")).toBeInTheDocument();

    const inputTerminals = container.querySelectorAll('[data-terminal-side="input"]');
    const outputTerminals = container.querySelectorAll('[data-terminal-side="output"]');
    expect(inputTerminals).toHaveLength(5);
    expect(outputTerminals).toHaveLength(5);
  });

  it("positions each node absolutely at its configured coordinates", () => {
    const { container } = render(<World />);
    const polysynthWrapper = container.querySelector(
      '[data-node-id="polysynth-1"]',
    )!.closest("span")!;
    expect(polysynthWrapper).toHaveStyle({ left: "150px", top: "150px" });
  });

  it("renders a Connections overlay sized to the world", () => {
    const { container } = render(<World />);
    const overlays = Array.from(container.querySelectorAll("svg")).filter(
      (svg) => svg.classList.contains("pointer-events-none"),
    );
    expect(overlays.length).toBeGreaterThan(0);
  });
});
