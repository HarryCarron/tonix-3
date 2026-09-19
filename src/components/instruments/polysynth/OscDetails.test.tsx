import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { OscDetails } from "./OscDetails";
import { DEFAULT_ADSR } from "@/components/controls/amp/types";

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
});

describe("OscDetails", () => {
  it("shows the waveform view when view is 'wave'", () => {
    render(
      <OscDetails
        view="wave"
        onViewChange={vi.fn()}
        envelope={DEFAULT_ADSR}
        onEnvelopeChange={vi.fn()}
      />,
    );
    expect(document.querySelector("path[stroke='white']")).toBeInTheDocument();
  });

  it("shows the Amp envelope editor when view is 'envelope'", () => {
    const { container } = render(
      <OscDetails
        view="envelope"
        onViewChange={vi.fn()}
        envelope={DEFAULT_ADSR}
        onEnvelopeChange={vi.fn()}
      />,
    );
    // Amp renders 4 drag handles (attack/decay/sustain/release)
    expect(container.querySelectorAll("circle")).toHaveLength(4);
  });

  it("shows the Additive editor when view is 'additive'", () => {
    render(
      <OscDetails
        view="additive"
        onViewChange={vi.fn()}
        envelope={DEFAULT_ADSR}
        onEnvelopeChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Randomize")).toBeInTheDocument();
  });

  it("calls onViewChange when a different view is picked", async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();
    render(
      <OscDetails
        view="wave"
        onViewChange={onViewChange}
        envelope={DEFAULT_ADSR}
        onEnvelopeChange={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByText("Additive"));

    expect(onViewChange).toHaveBeenCalledWith("additive");
  });
});
