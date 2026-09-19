import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RotaryControl from "./RotaryControl";

function mouseEvent(type: string, y: number) {
  return new MouseEvent(type, { bubbles: true, clientY: y });
}

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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("RotaryControl", () => {
  it("shows the uncontrolled default value as a percentage readout", () => {
    const { container } = render(<RotaryControl />);
    expect(container.querySelector("input")).toHaveValue("50");
  });

  it("reflects a controlled continuous value", () => {
    const { container } = render(
      <RotaryControl value={0.75} onChange={vi.fn()} />,
    );
    expect(container.querySelector("input")).toHaveValue("75");
  });

  it("shows the current stage's label in staged mode, defaulting to the first stage", () => {
    const stages = [
      { value: "8n", label: "1/8" },
      { value: "4n", label: "1/4" },
    ];
    const { container } = render(
      <RotaryControl mode="staged" stages={stages} />,
    );
    expect(container.querySelector("input")).toHaveValue("1/8");
  });

  it("commits a continuous drag's value on the next frame (drag up increases the value)", () => {
    const onChange = vi.fn();
    const { container } = render(
      <RotaryControl value={0.5} onChange={onChange} />,
    );
    const svg = container.querySelector("svg")!;

    act(() => svg.dispatchEvent(mouseEvent("mousedown", 100)));
    act(() => document.dispatchEvent(mouseEvent("mousemove", 80))); // dragged up 20px

    expect(onChange).not.toHaveBeenCalled();
    flushRaf();

    expect(onChange).toHaveBeenCalledWith(0.7); // 0.5 + 20/100
  });

  it("clamps the continuous drag value to [0, 1]", () => {
    const onChange = vi.fn();
    const { container } = render(
      <RotaryControl value={0.9} onChange={onChange} />,
    );
    const svg = container.querySelector("svg")!;

    act(() => svg.dispatchEvent(mouseEvent("mousedown", 100)));
    act(() => document.dispatchEvent(mouseEvent("mousemove", -900)));
    flushRaf();

    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("quantizes a staged drag to the nearest stage and only commits on a stage change", () => {
    const stages = [
      { value: "a", label: "A" },
      { value: "b", label: "B" },
      { value: "c", label: "C" },
    ];
    const onChange = vi.fn();
    const { container } = render(
      <RotaryControl
        mode="staged"
        stages={stages}
        value="a"
        onChange={onChange}
      />,
    );
    const svg = container.querySelector("svg")!;

    act(() => svg.dispatchEvent(mouseEvent("mousedown", 100)));
    // small drag - not enough to cross into the next stage
    act(() => document.dispatchEvent(mouseEvent("mousemove", 95)));
    flushRaf();
    expect(onChange).not.toHaveBeenCalled();

    // large drag up - full sweep, lands on the last stage
    act(() => document.dispatchEvent(mouseEvent("mousemove", -5)));
    flushRaf();
    expect(onChange).toHaveBeenCalledWith("c");
  });
});
