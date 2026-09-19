import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Navigator from "./Navigator";
import { ENV } from "@/env";

describe("Navigator", () => {
  beforeEach(() => {
    class MockResizeObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sizes the minimap world off ENV.worldDims and the fixed scale", () => {
    const host = document.createElement("div");
    const { container } = render(<Navigator host={host} />);

    const world = container.querySelector("#navigator\\:world") as HTMLDivElement;
    expect(world.style.width).toBe(`${ENV.worldDims * 0.032}px`);
    expect(world.style.height).toBe(`${ENV.worldDims * 0.032}px`);
  });

  it("renders the camera placeholder element", () => {
    const host = document.createElement("div");
    const { container } = render(<Navigator host={host} />);
    expect(container.querySelector("#navigator\\:camera")).toBeInTheDocument();
  });
});
