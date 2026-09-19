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

  it("observes the host element (the real workspace viewport) for resize", () => {
    const world = document.createElement("div");
    const host = document.createElement("div");

    new NavigatorController()
      .setScaleVal(0.1)
      .setWorldElement(world)
      .setHostElement(host)
      .init();

    expect(observeSpy).toHaveBeenCalledWith(host);
  });

  it("re-derives the minimap world's fixed size (not the host's) whenever the host resizes", () => {
    const world = document.createElement("div");
    const host = document.createElement("div");

    new NavigatorController()
      .setScaleVal(0.5)
      .setWorldElement(world)
      .setHostElement(host)
      .init();

    world.style.width = "";
    world.style.height = "";

    lastCallback!([
      { contentRect: { width: 200, height: 100 } } as ResizeObserverEntry,
    ]);

    // sized off ENV.worldDims, not the observed host contentRect - writing a
    // computed size onto the real viewport (`host`) crushes it instead
    expect(world.style.width).toBe(`${ENV.worldDims * 0.5}px`);
    expect(world.style.height).toBe(`${ENV.worldDims * 0.5}px`);
    expect(host.style.width).toBe("");
    expect(host.style.height).toBe("");
  });
});
