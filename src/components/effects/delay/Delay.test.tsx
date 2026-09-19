import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Delay } from "./Delay";

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

describe("Delay", () => {
  it("starts with 8n time, 50% feedback, and 50% wet", () => {
    const { container } = render(<Delay />);
    const inputs = container.querySelectorAll("input");

    expect(inputs[0]).toHaveValue("1/8");
    expect(inputs[1]).toHaveValue("50");
    expect(inputs[2]).toHaveValue("50");
  });

  it("updates the feedback readout when its knob is dragged", () => {
    const { container } = render(<Delay />);
    const svgs = container.querySelectorAll("svg");
    const inputs = container.querySelectorAll("input");

    // Time, Feedback, Wet controls in that order
    act(() => svgs[1].dispatchEvent(mouseEvent("mousedown", 100)));
    act(() => document.dispatchEvent(mouseEvent("mousemove", 70))); // +30px -> +0.3
    act(() => flushRaf());

    expect(inputs[1]).toHaveValue("80");
  });

  it("updates the wet readout when its knob is dragged", () => {
    const { container } = render(<Delay />);
    const svgs = container.querySelectorAll("svg");
    const inputs = container.querySelectorAll("input");

    act(() => svgs[2].dispatchEvent(mouseEvent("mousedown", 100)));
    act(() => document.dispatchEvent(mouseEvent("mousemove", 120))); // -20px -> -0.2
    act(() => flushRaf());

    expect(inputs[2]).toHaveValue("30");
  });

  it("updates the time readout to the nearest stage when its knob is dragged", () => {
    const { container } = render(<Delay />);
    const svgs = container.querySelectorAll("svg");
    const inputs = container.querySelectorAll("input");

    act(() => svgs[0].dispatchEvent(mouseEvent("mousedown", 100)));
    // large drag up - lands on the last stage ("1/32")
    act(() => document.dispatchEvent(mouseEvent("mousemove", -100)));
    act(() => flushRaf());

    expect(inputs[0]).toHaveValue("1/32");
  });
});
