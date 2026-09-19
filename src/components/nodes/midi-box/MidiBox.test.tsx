import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { MidiBox } from "./MidiBox";
import { TEST_PATTERNS } from "./MidiPattern";
import * as playerModule from "./useMidiPatternPlayer";
import type { TransportState } from "./useMidiPatternPlayer";

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  window.HTMLElement.prototype.setPointerCapture = vi.fn();
});

const basePlayer = {
  patterns: TEST_PATTERNS,
  patternIndex: 0,
  setPatternIndex: vi.fn(),
  transportState: "stopped" as TransportState,
  handlePlay: vi.fn(),
  handlePause: vi.fn(),
  handleStop: vi.fn(),
  handleRewind: vi.fn(),
};

function mockPlayer(overrides: Partial<typeof basePlayer> = {}) {
  vi.spyOn(playerModule, "useMidiPatternPlayer").mockReturnValue({
    ...basePlayer,
    ...overrides,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Play/Pause are icon-only buttons with no accessible name, so they're
// queried by DOM order instead: [Play, Pause, Stop, Rewind].
function getTransportButtons() {
  const buttons = screen.getAllByRole("button");
  return { play: buttons[0], pause: buttons[1], stop: buttons[2], rewind: buttons[3] };
}

describe("MidiBox", () => {
  it("disables Play while playing and enables it otherwise", () => {
    mockPlayer({ transportState: "playing" });
    render(<MidiBox />);
    expect(getTransportButtons().play).toBeDisabled();
  });

  it("disables Pause and Stop while stopped", () => {
    mockPlayer({ transportState: "stopped" });
    render(<MidiBox />);
    const { pause, stop } = getTransportButtons();
    expect(pause).toBeDisabled();
    expect(stop).toBeDisabled();
  });

  it("enables Pause and Stop while playing", () => {
    mockPlayer({ transportState: "playing" });
    render(<MidiBox />);
    const { pause, stop } = getTransportButtons();
    expect(pause).toBeEnabled();
    expect(stop).toBeEnabled();
  });

  it("calls the player's transport handlers when the buttons are clicked", async () => {
    const user = userEvent.setup();
    mockPlayer({ transportState: "playing" });
    render(<MidiBox />);
    const { pause, stop, rewind } = getTransportButtons();

    await user.click(pause);
    expect(basePlayer.handlePause).toHaveBeenCalled();

    await user.click(stop);
    expect(basePlayer.handleStop).toHaveBeenCalled();

    await user.click(rewind);
    expect(basePlayer.handleRewind).toHaveBeenCalled();
  });

  it("lists every pattern as a selectable option", async () => {
    const user = userEvent.setup();
    mockPlayer();
    render(<MidiBox />);

    await user.click(screen.getByRole("combobox"));

    const options = await screen.findAllByRole("option");
    expect(options).toHaveLength(TEST_PATTERNS.length);
    options.forEach((option, i) => {
      expect(option).toHaveTextContent(`Pattern ${i + 1}`);
    });
  });

  it("changes the pattern index when a different pattern is selected", async () => {
    const user = userEvent.setup();
    mockPlayer();
    render(<MidiBox />);

    await user.click(screen.getByRole("combobox"));
    const options = await screen.findAllByRole("option");
    await user.click(options[1]);

    expect(basePlayer.setPatternIndex).toHaveBeenCalledWith(1);
  });
});
