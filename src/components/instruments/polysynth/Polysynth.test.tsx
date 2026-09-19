import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { Polysynth } from "./Polysynth";
import { DEFAULT_POLYSYNTH_AUDIO_STATE } from "./polysynthAudioState";

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
  vi.stubGlobal("requestAnimationFrame", vi.fn());
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

describe("Polysynth", () => {
  it("renders 3 oscillators and the details panel", () => {
    render(<Polysynth />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getAllByRole("switch")).toHaveLength(3);
  });

  it("toggling an oscillator's switch updates only that oscillator, immutably", () => {
    const onAudioStateChange = vi.fn();
    render(
      <Polysynth
        audioState={DEFAULT_POLYSYNTH_AUDIO_STATE}
        onAudioStateChange={onAudioStateChange}
      />,
    );

    fireEvent.click(screen.getAllByRole("switch")[1]); // oscillator 2

    const next = onAudioStateChange.mock.calls[0][0];
    expect(next.oscillators[1].enabled).toBe(false);
    expect(next.oscillators[0]).toBe(DEFAULT_POLYSYNTH_AUDIO_STATE.oscillators[0]);
    expect(next.oscillators[2]).toBe(DEFAULT_POLYSYNTH_AUDIO_STATE.oscillators[2]);
    expect(next.envelope).toBe(DEFAULT_POLYSYNTH_AUDIO_STATE.envelope);
  });

  it("works fully uncontrolled, toggling its own internal state", () => {
    render(<Polysynth />);
    const switches = screen.getAllByRole("switch");

    expect(switches[0]).toHaveAttribute("data-state", "checked");
    fireEvent.click(switches[0]);
    expect(switches[0]).toHaveAttribute("data-state", "unchecked");
  });

  it("updates the envelope via the details panel without touching oscillators", () => {
    const onAudioStateChange = vi.fn();
    render(
      <Polysynth
        audioState={DEFAULT_POLYSYNTH_AUDIO_STATE}
        onAudioStateChange={onAudioStateChange}
      />,
    );

    // sustain stage header click cycles nothing (no curve), but attack does
    const attackRect = document.querySelectorAll(".interaction-layer rect")[0];
    fireEvent.click(attackRect);

    const next = onAudioStateChange.mock.calls[0][0];
    expect(next.envelope.attackCurve).toBe(1);
    expect(next.oscillators).toBe(DEFAULT_POLYSYNTH_AUDIO_STATE.oscillators);
  });
});
