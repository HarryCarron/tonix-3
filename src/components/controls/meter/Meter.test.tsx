import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Meter } from "./Meter";

function createFakeContext() {
  return {
    scale: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: "",
  } as unknown as CanvasRenderingContext2D;
}

describe("Meter", () => {
  let rafCallbacks: FrameRequestCallback[];

  beforeEach(() => {
    rafCallbacks = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders a canvas without crashing when the 2d context is unavailable", () => {
    const { container } = render(<Meter getValue={() => 0.5} />);
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("draws a vertical bar sized to the current value on each frame", () => {
    const fakeContext = createFakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      fakeContext,
    );
    vi.spyOn(
      HTMLDivElement.prototype,
      "offsetWidth",
      "get",
    ).mockReturnValue(10);
    vi.spyOn(
      HTMLDivElement.prototype,
      "offsetHeight",
      "get",
    ).mockReturnValue(20);

    render(<Meter getValue={() => 0.5} orientation="vertical" />);

    expect(rafCallbacks).toHaveLength(1);
    rafCallbacks[0](0);

    expect(fakeContext.clearRect).toHaveBeenCalledWith(0, 0, 10, 20);
    // half value, vertical bar grows from the bottom: height*0.5 = 10
    expect(fakeContext.fillRect).toHaveBeenCalledWith(0, 10, 10, 10);
  });

  it("draws a horizontal bar growing from the left", () => {
    const fakeContext = createFakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      fakeContext,
    );
    vi.spyOn(
      HTMLDivElement.prototype,
      "offsetWidth",
      "get",
    ).mockReturnValue(10);
    vi.spyOn(
      HTMLDivElement.prototype,
      "offsetHeight",
      "get",
    ).mockReturnValue(20);

    render(<Meter getValue={() => 0.25} orientation="horizontal" />);

    rafCallbacks[0](0);

    // width*0.25 = 2.5
    expect(fakeContext.fillRect).toHaveBeenCalledWith(0, 0, 2.5, 20);
  });

  it("clamps out-of-range values to [0, 1]", () => {
    const fakeContext = createFakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      fakeContext,
    );
    vi.spyOn(
      HTMLDivElement.prototype,
      "offsetWidth",
      "get",
    ).mockReturnValue(10);
    vi.spyOn(
      HTMLDivElement.prototype,
      "offsetHeight",
      "get",
    ).mockReturnValue(20);

    render(<Meter getValue={() => 5} orientation="horizontal" />);
    rafCallbacks[0](0);
    expect(fakeContext.fillRect).toHaveBeenCalledWith(0, 0, 10, 20);
  });
});
