import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import CanvasUtilities from "@/utils/canvas";
import { Filter } from "./Filter";

const { getFilterResponseDb } = vi.hoisted(() => ({
  getFilterResponseDb: vi.fn(() => new Float32Array([0, -3, -6])),
}));

vi.mock("./filter-response", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./filter-response")>();
  return { ...actual, getFilterResponseDb };
});

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
});

function createFakeContext() {
  return {
    scale: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    setLineDash: vi.fn(),
    strokeStyle: "",
    lineWidth: 0,
    lineCap: "butt" as CanvasLineCap,
    lineJoin: "miter" as CanvasLineJoin,
  };
}

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    createFakeContext() as unknown as CanvasRenderingContext2D,
  );
  getFilterResponseDb.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function setCoords(freq: number, q: number) {
  vi.spyOn(CanvasUtilities.prototype, "getTrueCoordinates").mockReturnValue([
    freq,
    q,
  ]);
}

describe("Filter", () => {
  it("renders the canvas, interaction layer, and frequency response curve without crashing", () => {
    render(<Filter />);
    expect(getFilterResponseDb).toHaveBeenCalledWith({
      freq: 0.5,
      q: 0.5,
      type: "BP",
    });
  });

  it("sets freq/q from a mousedown on the interaction rect", () => {
    setCoords(0.7, 0.2);
    const { container } = render(<Filter />);
    getFilterResponseDb.mockClear();

    const rect = container.querySelector(".interaction-layer rect")!;
    act(() => fireEvent.mouseDown(rect, { clientX: 1, clientY: 1 }));

    expect(getFilterResponseDb).toHaveBeenCalledWith({
      freq: 0.7,
      q: 0.2,
      type: "BP",
    });

    // trackGlobalMouseMove listens on window until mouseup - end the drag so
    // it doesn't leak a listener into later tests
    act(() => window.dispatchEvent(new MouseEvent("mouseup")));
  });

  it("keeps updating freq/q on subsequent window mousemoves during a drag", () => {
    setCoords(0.3, 0.3);
    const { container } = render(<Filter />);

    const handle = container.querySelector(".interaction-layer circle")!;
    act(() => fireEvent.mouseDown(handle, { clientX: 1, clientY: 1 }));

    setCoords(0.9, 0.9);
    getFilterResponseDb.mockClear();
    act(() => {
      window.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 2, clientY: 2 }),
      );
    });

    expect(getFilterResponseDb).toHaveBeenCalledWith({
      freq: 0.9,
      q: 0.9,
      type: "BP",
    });

    act(() => window.dispatchEvent(new MouseEvent("mouseup")));
  });

  it("changes the filter type via the Select and redraws with the new type", async () => {
    const user = userEvent.setup();
    render(<Filter />);
    getFilterResponseDb.mockClear();

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByText("LP"));

    expect(getFilterResponseDb).toHaveBeenCalledWith({
      freq: 0.5,
      q: 0.5,
      type: "LP",
    });
  });
});
