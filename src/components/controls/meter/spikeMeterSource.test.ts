import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSpikeMeterSource } from "./spikeMeterSource";

describe("createSpikeMeterSource", () => {
  let now: number;

  beforeEach(() => {
    now = 1000;
    vi.spyOn(performance, "now").mockImplementation(() => now);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts at 0", () => {
    const source = createSpikeMeterSource();
    expect(source.getValue()).toBe(0);
  });

  it("jumps to the triggered velocity immediately", () => {
    const source = createSpikeMeterSource();
    source.trigger(0.8);
    expect(source.getValue()).toBe(0.8);
  });

  it("keeps the higher peak when triggered again before decaying away", () => {
    const source = createSpikeMeterSource();
    source.trigger(0.4);
    source.trigger(0.9);
    source.trigger(0.2);
    expect(source.getValue()).toBe(0.9);
  });

  it("decays linearly at the configured rate per second", () => {
    const source = createSpikeMeterSource(2);
    source.trigger(1);

    now += 250; // 0.25s elapsed
    expect(source.getValue()).toBeCloseTo(0.5);
  });

  it("never decays below 0", () => {
    const source = createSpikeMeterSource(2);
    source.trigger(0.1);

    now += 5000;
    expect(source.getValue()).toBe(0);
  });

  it("can be re-triggered after decaying to 0", () => {
    const source = createSpikeMeterSource(2);
    source.trigger(1);
    now += 5000;
    source.getValue();

    source.trigger(0.5);
    expect(source.getValue()).toBe(0.5);
  });
});
