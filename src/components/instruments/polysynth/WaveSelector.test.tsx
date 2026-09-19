import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { WaveSelector, WaveSelectorWithFreq } from "./WaveSelector";

beforeAll(() => {
  // jsdom doesn't implement these, and Radix's Select uses them internally
  // for its pointer-driven open/scroll behavior.
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
});

describe("WaveSelector", () => {
  it("shows the current wave as the trigger's selected value", () => {
    render(<WaveSelector value="sawtooth" onValueChange={vi.fn()} />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Saw");
  });

  it("calls onValueChange with the picked wave", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<WaveSelector value="sine" onValueChange={onValueChange} />);

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByText("Srq"));

    expect(onValueChange).toHaveBeenCalledWith("square");
  });
});

describe("WaveSelectorWithFreq", () => {
  it("renders the detune value formatted to 2 decimal places", () => {
    render(
      <WaveSelectorWithFreq
        value="sine"
        onValueChange={vi.fn()}
        detune={1.5}
        onDetuneChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("spinbutton")).toHaveValue(1.5);
  });

  it("calls onDetuneChange with the parsed numeric value", () => {
    const onDetuneChange = vi.fn();
    render(
      <WaveSelectorWithFreq
        value="sine"
        onValueChange={vi.fn()}
        detune={0}
        onDetuneChange={onDetuneChange}
      />,
    );

    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "3.5" },
    });

    expect(onDetuneChange).toHaveBeenCalledWith(3.5);
  });

  it("does not call onDetuneChange when the input is not a valid number", () => {
    const onDetuneChange = vi.fn();
    render(
      <WaveSelectorWithFreq
        value="sine"
        onValueChange={vi.fn()}
        detune={0}
        onDetuneChange={onDetuneChange}
      />,
    );

    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "" },
    });

    expect(onDetuneChange).not.toHaveBeenCalled();
  });
});
