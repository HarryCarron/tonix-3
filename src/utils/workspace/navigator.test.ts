import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NavigatorController } from "./navigator";
import { ENV } from "@/env";

type ResizeCallback = (entries: ResizeObserverEntry[]) => void;

describe("NavigatorController", () => {
  let observeSpy: ReturnType<typeof vi.fn>;
  let lastCallback: ResizeCallback | undefined;

  beforeEach(() => {
    observeSpy = vi.fn();
    lastCallback = undefined;

    class MockResizeObserver {
      constructor(cb: ResizeCallback) {
        lastCallback = cb;
      }
      observe = observeSpy;
      unobserve = vi.fn();
      disconnect = vi.fn();
    }

    vi.stubGlobal("ResizeObserver", MockResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sizes the world element off ENV.worldDims and the configured scale on init", () => {
    const world = document.createElement("div");
    const host = document.createElement("div");

    new NavigatorController()
      .setScaleVal(0.1)
      .setWorldElement(world)
      .setHostElement(host)
      .init();

    expect(world.style.width).toBe(`${ENV.worldDims * 0.1}px`);
    expect(world.style.height).toBe(`${ENV.worldDims * 0.1}px`);
  });

  it("observes the world element for resize", () => {
    const world = document.createElement("div");
    const host = document.createElement("div");

    new NavigatorController()
      .setScaleVal(0.1)
      .setWorldElement(world)
      .setHostElement(host)
      .init();

    expect(observeSpy).toHaveBeenCalledWith(world);
  });

  it("resizes the host to match the observed world size, scaled", () => {
    const world = document.createElement("div");
    const host = document.createElement("div");

    new NavigatorController()
      .setScaleVal(0.5)
      .setWorldElement(world)
      .setHostElement(host)
      .init();

    lastCallback!([
      { contentRect: { width: 200, height: 100 } } as ResizeObserverEntry,
    ]);

    expect(host.style.width).toBe("100px");
    expect(host.style.height).toBe("50px");
  });
});
