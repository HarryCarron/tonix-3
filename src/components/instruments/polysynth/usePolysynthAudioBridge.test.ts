import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface MockMeterInstance {
  disposed: boolean;
  value: number | number[];
  getValue: () => number | number[];
}

interface MockPolySynthInstance {
  voice: unknown;
  options: Record<string, unknown>;
  setCalls: unknown[];
  triggerCalls: unknown[];
  disposed: boolean;
}

const { meterInstances, synthInstances } = vi.hoisted(() => {
  return {
    meterInstances: [] as MockMeterInstance[],
    synthInstances: [] as MockPolySynthInstance[],
  };
});

vi.mock("tone", () => {
  class Meter {
    disposed = false;
    value: number | number[] = 0;
    constructor() {
      meterInstances.push(this);
    }
    getValue() {
      return this.value;
    }
    dispose() {
      this.disposed = true;
    }
  }

  class PolySynth {
    voice: unknown;
    options: Record<string, unknown>;
    setCalls: unknown[] = [];
    triggerCalls: unknown[] = [];
    disposed = false;

    constructor(voice: unknown, options: Record<string, unknown>) {
      this.voice = voice;
      this.options = options;
      synthInstances.push(this);
    }

    toDestination() {
      return this;
    }

    set(options: unknown) {
      this.setCalls.push(options);
    }

    triggerAttackRelease(...args: unknown[]) {
      this.triggerCalls.push(args);
    }

    dispose() {
      this.disposed = true;
    }
  }

  return { Meter, PolySynth };
});

const { usePolysynthAudioBridge } = await import("./usePolysynthAudioBridge");

let rafQueue: FrameRequestCallback[] = [];
let rafId = 0;
let cancelAnimationFrameMock: ReturnType<typeof vi.fn>;

function flushRaf() {
  const queue = rafQueue;
  rafQueue = [];
  queue.forEach((cb) => cb(performance.now()));
}

beforeEach(() => {
  meterInstances.length = 0;
  synthInstances.length = 0;
  rafQueue = [];
  rafId = 0;
  cancelAnimationFrameMock = vi.fn();
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    rafQueue.push(cb);
    return ++rafId;
  });
  vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrameMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("usePolysynthAudioBridge", () => {
  it("creates one PolySynth wired to 3 per-oscillator meter taps", () => {
    renderHook(() => usePolysynthAudioBridge());

    expect(meterInstances).toHaveLength(3);
    expect(synthInstances).toHaveLength(1);
    expect(synthInstances[0].options).toEqual({
      oscillator0MeterTap: meterInstances[0],
      oscillator1MeterTap: meterInstances[1],
      oscillator2MeterTap: meterInstances[2],
    });
  });

  it("applies the full default audio state to the synth on the next frame", () => {
    renderHook(() => usePolysynthAudioBridge());

    flushRaf();

    expect(synthInstances[0].setCalls).toHaveLength(1);
    const defaultOscillator = { type: "sine", phase: 180, detune: 0 };
    expect(synthInstances[0].setCalls[0]).toEqual({
      oscillator0: defaultOscillator,
      oscillator0Gain: { gain: 0.5 },
      oscillator0Pan: { pan: 0 },
      oscillator1: defaultOscillator,
      oscillator1Gain: { gain: 0.5 },
      oscillator1Pan: { pan: 0 },
      oscillator2: defaultOscillator,
      oscillator2Gain: { gain: 0.5 },
      oscillator2Pan: { pan: 0 },
      envelope: {
        attack: 0.2,
        attackCurve: "linear",
        decay: 0.4,
        decayCurve: "linear",
        sustain: 0.5,
        release: 0.6,
        releaseCurve: "linear",
      },
    });
  });

  it("coalesces rapid audioState updates into a single set() call per frame", () => {
    const { result } = renderHook(() => usePolysynthAudioBridge());
    flushRaf(); // apply and clear the initial mount state

    act(() => {
      result.current.onAudioStateChange((prev) => ({
        ...prev,
        envelope: { ...prev.envelope, attack: 0.2 },
      }));
      result.current.onAudioStateChange((prev) => ({
        ...prev,
        envelope: { ...prev.envelope, attack: 0.4 },
      }));
    });

    expect(rafQueue).toHaveLength(1);

    flushRaf();

    expect(synthInstances[0].setCalls).toHaveLength(2);
    expect(synthInstances[0].setCalls[1]).toEqual({
      envelope: { attack: 0.8 },
    });
  });

  it("delegates trigger() to the synth's triggerAttackRelease", () => {
    const { result } = renderHook(() => usePolysynthAudioBridge());

    result.current.trigger("C4", "8n", 1.2, 0.9);

    expect(synthInstances[0].triggerCalls).toEqual([["C4", "8n", 1.2, 0.9]]);
  });

  it("smooths a meter's raw reading based on elapsed time", () => {
    let now = 1000;
    vi.spyOn(performance, "now").mockImplementation(() => now);

    const { result } = renderHook(() => usePolysynthAudioBridge());
    meterInstances[0].value = 1;
    now += 1000; // dt clamps to 0.1s

    const level = result.current.getOscillatorLevel(0);

    // smoothed = 0 + (1 - 0) * min(1, 0.1 * 8) = 0.8
    expect(level).toBeCloseTo(0.8);
  });

  it("falls back to the oscillator-0 reader for an out-of-range index", () => {
    let now = 1000;
    vi.spyOn(performance, "now").mockImplementation(() => now);

    const { result } = renderHook(() => usePolysynthAudioBridge());
    meterInstances[0].value = 1;
    now += 1000;

    expect(result.current.getOscillatorLevel(99)).toBeCloseTo(0.8);
  });

  it("disposes the synth and every meter tap on unmount", () => {
    const { unmount } = renderHook(() => usePolysynthAudioBridge());

    unmount();

    expect(synthInstances[0].disposed).toBe(true);
    meterInstances.forEach((meter) => expect(meter.disposed).toBe(true));
  });

  it("cancels a pending animation frame on unmount", () => {
    const { result, unmount } = renderHook(() => usePolysynthAudioBridge());
    flushRaf();

    act(() => {
      result.current.onAudioStateChange((prev) => ({ ...prev }));
    });
    expect(rafQueue).toHaveLength(1);

    unmount();

    expect(cancelAnimationFrameMock).toHaveBeenCalled();
  });
});
