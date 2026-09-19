import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Amp } from "./Amp";
import CanvasUtilities from "@/utils/canvas";
import { DEFAULT_ADSR, MAX_SUSTAIN_WIDTH, type ADSR } from "./types";

function createFakeContext() {
  return {
    scale: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    rect: vi.fn(),
    arc: vi.fn(),
    fillText: vi.fn(),
    setLineDash: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    strokeStyle: "",
    fillStyle: "",
    lineWidth: 0,
    lineCap: "butt" as CanvasLineCap,
    lineJoin: "miter" as CanvasLineJoin,
    font: "",
    textAlign: "start" as CanvasTextAlign,
    shadowBlur: 0,
    shadowColor: "",
  };
}

let rafQueue: FrameRequestCallback[] = [];

function flushRaf() {
  const queue = rafQueue;
  rafQueue = [];
  queue.forEach((cb) => cb(0));
}

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    createFakeContext() as unknown as CanvasRenderingContext2D,
  );
  rafQueue = [];
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    rafQueue.push(cb);
    return rafQueue.length;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function setCoords(x: number, y: number) {
  vi.spyOn(CanvasUtilities.prototype, "getTrueCoordinates").mockReturnValue([
    x,
    y,
  ]);
}

// AmpInteractionLayer renders 4 <rect> stage-header hitboxes (cycle the
// segment's curve on click) followed by 4 <circle> drag handles (set the
// segment's position/value), both in stage order [attack, decay, sustain, release].
function dragHandle(container: HTMLElement, index: number) {
  fireEvent.mouseDown(container.querySelectorAll("circle")[index], {
    clientX: 1,
    clientY: 1,
  });
}

function clickStageHeader(container: HTMLElement, index: number) {
  fireEvent.click(container.querySelectorAll("rect")[index]);
}

describe("Amp", () => {
  it("renders a canvas and the interaction layer without crashing", () => {
    const { container } = render(<Amp />);
    expect(container.querySelector("canvas")).toBeInTheDocument();
    expect(container.querySelectorAll("circle")).toHaveLength(4);
  });

  describe("dragging a handle (handleClick)", () => {
    it("sets attack from the attack handle", () => {
      setCoords(0.3, 0);
      const onChange = vi.fn();
      const { container } = render(
        <Amp value={DEFAULT_ADSR} onChange={onChange} />,
      );

      dragHandle(container, 0);

      expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_ADSR, attack: 0.3 });
    });

    it("clamps a sub-zero coordinate to 0", () => {
      setCoords(-5, -5);
      const onChange = vi.fn();
      const { container } = render(
        <Amp value={DEFAULT_ADSR} onChange={onChange} />,
      );

      dragHandle(container, 0);

      expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_ADSR, attack: 0 });
    });

    it("does not change attack when the resulting total stage width would reach 1", () => {
      setCoords(0.99, 0);
      const onChange = vi.fn();
      const { container } = render(
        <Amp value={DEFAULT_ADSR} onChange={onChange} />,
      );

      dragHandle(container, 0);

      expect(onChange).toHaveBeenCalledWith(DEFAULT_ADSR);
    });

    it("sets decay and sustain from the decay handle", () => {
      const amp: ADSR = { ...DEFAULT_ADSR, attack: 0.1 };
      setCoords(0.4, 0.6);
      const onChange = vi.fn();
      const { container } = render(<Amp value={amp} onChange={onChange} />);

      dragHandle(container, 1);

      expect(onChange).toHaveBeenCalledWith({
        ...amp,
        decay: expect.closeTo(0.3),
        sustain: 0.6,
      });
    });

    it("stretches decay (keeping sustainWidth fixed) from the sustain-right handle", () => {
      const amp: ADSR = {
        ...DEFAULT_ADSR,
        attack: 0.1,
        sustainWidth: MAX_SUSTAIN_WIDTH,
      };
      setCoords(0.5, 0.4);
      const onChange = vi.fn();
      const { container } = render(<Amp value={amp} onChange={onChange} />);

      dragHandle(container, 2);

      expect(onChange).toHaveBeenCalledWith({
        ...amp,
        decay: expect.closeTo(0.35),
        sustainWidth: MAX_SUSTAIN_WIDTH,
        sustain: 0.4,
      });
    });

    it("sets release from the release handle", () => {
      const amp: ADSR = {
        ...DEFAULT_ADSR,
        attack: 0.1,
        decay: 0.2,
        sustainWidth: 0.05,
      };
      setCoords(0.7, 0);
      const onChange = vi.fn();
      const { container } = render(<Amp value={amp} onChange={onChange} />);

      dragHandle(container, 3);

      expect(onChange).toHaveBeenCalledWith({
        ...amp,
        release: expect.closeTo(0.35),
      });
    });

    it("coalesces subsequent window mousemoves into a single update per frame", () => {
      setCoords(0.3, 0);
      const onChange = vi.fn();
      const { container } = render(
        <Amp value={DEFAULT_ADSR} onChange={onChange} />,
      );

      dragHandle(container, 0); // initial mousedown -> 1 immediate call
      expect(onChange).toHaveBeenCalledTimes(1);

      setCoords(0.5, 0);
      act(() => {
        window.dispatchEvent(new MouseEvent("mousemove", { clientX: 2, clientY: 2 }));
        window.dispatchEvent(new MouseEvent("mousemove", { clientX: 3, clientY: 3 }));
        window.dispatchEvent(new MouseEvent("mousemove", { clientX: 4, clientY: 4 }));
      });
      expect(onChange).toHaveBeenCalledTimes(1); // still coalescing

      act(() => flushRaf());
      expect(onChange).toHaveBeenCalledTimes(2); // one flush, one more commit
    });
  });

  describe("clicking a stage header (ampClicked cycles the curve)", () => {
    it("cycles the attack curve LIN -> EXP", () => {
      const amp: ADSR = { ...DEFAULT_ADSR, attackCurve: 0 };
      const onChange = vi.fn();
      const { container } = render(<Amp value={amp} onChange={onChange} />);

      clickStageHeader(container, 0);

      expect(onChange).toHaveBeenCalledWith({ ...amp, attackCurve: 1 });
    });

    it("wraps the decay curve from LOG back to LIN", () => {
      const amp: ADSR = { ...DEFAULT_ADSR, decayCurve: 2 };
      const onChange = vi.fn();
      const { container } = render(<Amp value={amp} onChange={onChange} />);

      clickStageHeader(container, 1);

      expect(onChange).toHaveBeenCalledWith({ ...amp, decayCurve: 0 });
    });

    it("cycles the release curve EXP -> LOG", () => {
      const amp: ADSR = { ...DEFAULT_ADSR, releaseCurve: 1 };
      const onChange = vi.fn();
      const { container } = render(<Amp value={amp} onChange={onChange} />);

      clickStageHeader(container, 3);

      expect(onChange).toHaveBeenCalledWith({ ...amp, releaseCurve: 2 });
    });

    it("does nothing when the sustain stage header is clicked (no curve to cycle)", () => {
      const onChange = vi.fn();
      const { container } = render(
        <Amp value={DEFAULT_ADSR} onChange={onChange} />,
      );

      clickStageHeader(container, 2);

      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
