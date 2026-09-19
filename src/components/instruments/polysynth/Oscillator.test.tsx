import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { Oscillator } from "./Oscillator";

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
});

let rafQueue: FrameRequestCallback[] = [];

function flushRaf() {
  const queue = rafQueue;
  rafQueue = [];
  queue.forEach((cb) => cb(0));
}

beforeEach(() => {
  rafQueue = [];
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    rafQueue.push(cb);
    return rafQueue.length;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

const baseProps = {
  id: "osc1",
  number: 0,
  wave: "sine" as const,
  onWaveChange: vi.fn(),
  enabled: true,
  onEnabledChange: vi.fn(),
  detune: 0,
  onDetuneChange: vi.fn(),
  phase: 0.5,
  onPhaseChange: vi.fn(),
  gain: 0.5,
  onGainChange: vi.fn(),
  pan: 0.5,
  onPanChange: vi.fn(),
};

describe("Oscillator", () => {
  it("shows its 1-based oscillator number", () => {
    render(<Oscillator {...baseProps} number={2} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("toggles enabled via the switch", () => {
    const onEnabledChange = vi.fn();
    render(<Oscillator {...baseProps} enabled={true} onEnabledChange={onEnabledChange} />);

    fireEvent.click(screen.getByRole("switch"));

    expect(onEnabledChange).toHaveBeenCalledWith(false);
  });

  it("calls onDetuneChange from the detune input", () => {
    const onDetuneChange = vi.fn();
    render(<Oscillator {...baseProps} onDetuneChange={onDetuneChange} />);

    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "2.5" },
    });

    expect(onDetuneChange).toHaveBeenCalledWith(2.5);
  });

  it("calls onGainChange when the Gain knob is dragged", () => {
    const onGainChange = vi.fn();
    render(<Oscillator {...baseProps} onGainChange={onGainChange} />);

    const gainSvg = screen.getByText("Gain").closest("span")!.querySelector("svg")!;
    act(() =>
      gainSvg.dispatchEvent(
        new MouseEvent("mousedown", { bubbles: true, clientY: 100 }),
      ),
    );
    act(() =>
      document.dispatchEvent(
        new MouseEvent("mousemove", { bubbles: true, clientY: 80 }),
      ),
    );
    act(() => flushRaf());

    expect(onGainChange).toHaveBeenCalledWith(0.7); // 0.5 + 20/100
  });
});
