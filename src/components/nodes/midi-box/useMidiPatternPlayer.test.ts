import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface MockPartInstance {
  events: unknown;
  loop: boolean;
  loopEnd: unknown;
  started: number | null;
  disposed: boolean;
  callback: (time: number, event: unknown) => void;
}

const { partInstances, transport, startMock } = vi.hoisted(() => {
  return {
    partInstances: [] as MockPartInstance[],
    transport: { start: vi.fn(), pause: vi.fn(), stop: vi.fn(), position: 0 as number },
    startMock: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("tone", () => {
  class Part {
    callback: (time: number, event: unknown) => void;
    events: unknown;
    loop = false;
    loopEnd: unknown;
    started: number | null = null;
    disposed = false;

    constructor(callback: (time: number, event: unknown) => void, events: unknown) {
      this.callback = callback;
      this.events = events;
      partInstances.push(this);
    }

    start(time: number) {
      this.started = time;
    }

    dispose() {
      this.disposed = true;
    }
  }

  return {
    Part,
    start: startMock,
    getTransport: () => transport,
  };
});

const { useMidiPatternPlayer } = await import("./useMidiPatternPlayer");
const { PATTERN_LENGTH } = await import("./MidiPattern");

const patternA = [{ time: "0:0:0", note: "C4", duration: "8n", velocity: 0.9 }];
const patternB = [{ time: "0:0:0", note: "D4", duration: "8n" }];

beforeEach(() => {
  partInstances.length = 0;
  transport.start.mockClear();
  transport.pause.mockClear();
  transport.stop.mockClear();
  transport.position = 0;
  startMock.mockClear();
});

describe("useMidiPatternPlayer", () => {
  it("creates a looping Part for the initial pattern and starts it at 0", () => {
    renderHook(() => useMidiPatternPlayer([patternA, patternB]));

    expect(partInstances).toHaveLength(1);
    const part = partInstances[0];
    expect(part.events).toBe(patternA);
    expect(part.loop).toBe(true);
    expect(part.loopEnd).toBe(PATTERN_LENGTH);
    expect(part.started).toBe(0);
  });

  it("disposes the old part and creates a new one when the pattern changes", () => {
    const { result } = renderHook(() =>
      useMidiPatternPlayer([patternA, patternB]),
    );

    act(() => result.current.setPatternIndex(1));

    expect(partInstances).toHaveLength(2);
    expect(partInstances[0].disposed).toBe(true);
    expect(partInstances[1].events).toBe(patternB);
  });

  it("disposes the part on unmount", () => {
    const { unmount } = renderHook(() => useMidiPatternPlayer([patternA]));
    unmount();
    expect(partInstances[0].disposed).toBe(true);
  });

  it("uses a per-pattern loopLength override instead of PATTERN_LENGTH", () => {
    renderHook(() => useMidiPatternPlayer([patternA], undefined, ["2m"]));
    expect(partInstances[0].loopEnd).toBe("2m");
  });

  it("invokes onTrigger with the event's velocity when provided", () => {
    const onTrigger = vi.fn();
    renderHook(() => useMidiPatternPlayer([patternA], onTrigger));

    partInstances[0].callback(2, patternA[0]);

    expect(onTrigger).toHaveBeenCalledWith("C4", "8n", 2, 0.9);
  });

  it("defaults velocity to 0.8 when the event omits it", () => {
    const onTrigger = vi.fn();
    renderHook(() => useMidiPatternPlayer([patternB], onTrigger));

    partInstances[0].callback(1.5, patternB[0]);

    expect(onTrigger).toHaveBeenCalledWith("D4", "8n", 1.5, 0.8);
  });

  it("handlePlay starts the Tone context and transport, marking state playing", async () => {
    const { result } = renderHook(() => useMidiPatternPlayer([patternA]));

    await act(async () => {
      await result.current.handlePlay();
    });

    expect(startMock).toHaveBeenCalled();
    expect(transport.start).toHaveBeenCalled();
    expect(result.current.transportState).toBe("playing");
  });

  it("handlePause pauses the transport and marks state paused", () => {
    const { result } = renderHook(() => useMidiPatternPlayer([patternA]));

    act(() => result.current.handlePause());

    expect(transport.pause).toHaveBeenCalled();
    expect(result.current.transportState).toBe("paused");
  });

  it("handleStop stops the transport and marks state stopped", () => {
    const { result } = renderHook(() => useMidiPatternPlayer([patternA]));

    act(() => result.current.handleStop());

    expect(transport.stop).toHaveBeenCalled();
    expect(result.current.transportState).toBe("stopped");
  });

  it("handleRewind resets the transport position to 0", () => {
    transport.position = 42;
    const { result } = renderHook(() => useMidiPatternPlayer([patternA]));

    act(() => result.current.handleRewind());

    expect(transport.position).toBe(0);
  });
});
