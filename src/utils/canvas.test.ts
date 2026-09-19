import { describe, expect, it, vi } from "vitest";
import type { RefObject } from "react";
import CanvasUtilities from "./canvas";

function createFakeContext() {
  return {
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
    scale: vi.fn(),
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

function createFakeCanvas(ctx: ReturnType<typeof createFakeContext>) {
  return {
    width: 0,
    height: 0,
    style: { width: "", height: "" },
    getContext: vi.fn(() => ctx as unknown as CanvasRenderingContext2D),
    getBoundingClientRect: vi.fn(() => ({
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON() {},
    })),
  };
}

function createUtils(width = 100, height = 50, setCanvasDims = true) {
  const ctx = createFakeContext();
  const canvasElem = createFakeCanvas(ctx);
  const canvas = { current: canvasElem } as unknown as RefObject<HTMLCanvasElement>;
  const utils = new CanvasUtilities(canvas, 5, 10, width, height, setCanvasDims);
  return { utils, ctx, canvasElem };
}

describe("CanvasUtilities", () => {
  it("sets pixel-scaled canvas dims and CSS dims, then scales the context, when setCanvasDims is true", () => {
    const { ctx, canvasElem } = createUtils(100, 50, true);

    expect(canvasElem.width).toBe(300);
    expect(canvasElem.height).toBe(150);
    expect(canvasElem.style.width).toBe("100px");
    expect(canvasElem.style.height).toBe("50px");
    expect(ctx.scale).toHaveBeenCalledWith(3, 3);
  });

  it("leaves canvas dims untouched when setCanvasDims is false", () => {
    const { canvasElem } = createUtils(100, 50, false);
    expect(canvasElem.width).toBe(0);
    expect(canvasElem.height).toBe(0);
  });

  it("clear() clears the full logical canvas area and is chainable", () => {
    const { utils, ctx } = createUtils(100, 50);
    const result = utils.clear();
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 100, 50);
    expect(result).toBe(utils);
  });

  describe("setStyle", () => {
    it("maps each style key onto the matching context property/call", () => {
      const { utils, ctx } = createUtils();
      utils.setStyle({
        strokeColor: "red",
        lineWidth: 3,
        fillColor: "blue",
        lineCap: "round",
        lineJoin: "bevel",
        lineDash: [1, 2],
        font: "12px sans-serif",
        textAlign: "center",
        fillStyle: "green",
        glow: [4, "yellow"],
      });

      expect(ctx.strokeStyle).toBe("red");
      expect(ctx.lineWidth).toBe(3);
      expect(ctx.fillStyle).toBe("green");
      expect(ctx.lineCap).toBe("round");
      expect(ctx.lineJoin).toBe("bevel");
      expect(ctx.setLineDash).toHaveBeenCalledWith([1, 2]);
      expect(ctx.font).toBe("12px sans-serif");
      expect(ctx.textAlign).toBe("center");
      expect(ctx.shadowBlur).toBe(4);
      expect(ctx.shadowColor).toBe("yellow");
    });

    it("fillColor is applied before a later fillStyle key overrides it", () => {
      const { utils, ctx } = createUtils();
      utils.setStyle({ fillColor: "blue", fillStyle: "green" });
      expect(ctx.fillStyle).toBe("green");
    });
  });

  describe("styleProfile", () => {
    it("applies a registered profile by key", () => {
      const { utils, ctx } = createUtils();
      utils.setStyleProfiles({ active: { strokeColor: "red" } });
      utils.styleProfile("active");
      expect(ctx.strokeStyle).toBe("red");
    });

    it("logs an error for an unrecognized profile key", () => {
      const { utils } = createUtils();
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      utils.styleProfile("missing");
      expect(errorSpy).toHaveBeenCalledWith("missing is not a recognised profile key!");
      errorSpy.mockRestore();
    });
  });

  it("line() draws a line and is chainable", () => {
    const { utils, ctx } = createUtils();
    const result = utils.line(0, 0, 10, 10);
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 0);
    expect(ctx.lineTo).toHaveBeenCalledWith(10, 10);
    expect(ctx.stroke).toHaveBeenCalled();
    expect(result).toBe(utils);
  });

  it("curve() draws a quadratic curve", () => {
    const { utils, ctx } = createUtils();
    utils.curve(0, 0, 5, 5, 10, 0);
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 0);
    expect(ctx.quadraticCurveTo).toHaveBeenCalledWith(5, 5, 10, 0);
  });

  it("tracks shape segments and replays them on drawShape", () => {
    const { utils, ctx } = createUtils();
    utils
      .trackShape()
      .line(0, 0, 10, 0)
      .curve(10, 0, 15, 5, 20, 0)
      .stopTrackingShape();

    ctx.moveTo.mockClear();
    ctx.lineTo.mockClear();
    ctx.quadraticCurveTo.mockClear();
    ctx.stroke.mockClear();

    utils.drawShape(true, true);

    expect(ctx.moveTo).toHaveBeenCalledWith(0, 0);
    expect(ctx.lineTo).toHaveBeenCalledWith(10, 0);
    expect(ctx.quadraticCurveTo).toHaveBeenCalledWith(15, 5, 20, 0);
    expect(ctx.closePath).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalledTimes(2);

    // clear: true empties the tracked shape
    ctx.moveTo.mockClear();
    utils.drawShape(true, false);
    expect(ctx.moveTo).not.toHaveBeenCalled();
  });

  it("fill() sets the fill color and fills", () => {
    const { utils, ctx } = createUtils();
    utils.fill("purple");
    expect(ctx.fillStyle).toBe("purple");
    expect(ctx.fill).toHaveBeenCalled();
  });

  it("gradientFill() builds a linear gradient with the given stops", () => {
    const { utils, ctx } = createUtils();
    utils.gradientFill(0, 0, 10, 10, "red", "blue");
    expect(ctx.createLinearGradient).toHaveBeenCalledWith(0, 0, 10, 10);
    expect(ctx.fill).toHaveBeenCalled();
  });

  it("path() draws bezier curves for each control-point set", () => {
    const { utils, ctx } = createUtils();
    utils.path([[0, 0, 5, 5, 10, 10]]);
    expect(ctx.bezierCurveTo).toHaveBeenCalledWith(0, 0, 5, 5, 10, 10);
    expect(ctx.stroke).toHaveBeenCalled();
  });

  describe("rect", () => {
    it("fills and strokes a rect when fill is true", () => {
      const { utils, ctx } = createUtils();
      utils.rect(0, 0, 10, 10, true);
      expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 10, 10);
      expect(ctx.strokeRect).toHaveBeenCalledWith(0, 0, 10, 10);
    });

    it("only outlines a rect when fill is false", () => {
      const { utils, ctx } = createUtils();
      utils.rect(0, 0, 10, 10, false);
      expect(ctx.fillRect).not.toHaveBeenCalled();
      expect(ctx.rect).toHaveBeenCalledWith(0, 0, 10, 10);
    });
  });

  it("circle() draws a full-circle arc", () => {
    const { utils, ctx } = createUtils();
    utils.circle(5, 5, 3);
    expect(ctx.arc).toHaveBeenCalledWith(5, 5, 3, 0, 2 * Math.PI);
    expect(ctx.stroke).toHaveBeenCalled();
  });

  describe("getTrueCoordinates", () => {
    it("maps a client point to normalized [0,1] canvas coordinates", () => {
      const { utils, canvasElem } = createUtils(100, 100, false);
      // xPad=5, yPad=10 (from createUtils), so travel = 100-10=90 / 100-20=80
      canvasElem.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 0,
        toJSON() {},
      }));

      const [x, y] = utils.getTrueCoordinates(50, 50);
      // relativeX = 50 - 0 - 5 = 45; mappedX = 45/90 = 0.5
      expect(x).toBeCloseTo(0.5);
      // relativeY = floor(80 - (50-0-10)) = floor(80-40) = 40; mappedY = 40/80 = 0.5
      expect(y).toBeCloseTo(0.5);
    });

    it("clamps normalized coordinates to [0, 1] when validate is true", () => {
      const { utils, canvasElem } = createUtils(100, 100, false);
      canvasElem.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 0,
        toJSON() {},
      }));

      const [x, y] = utils.getTrueCoordinates(-1000, -1000, true);
      expect(x).toBe(0);
      expect(y).toBe(1);
    });
  });

  it("multiple() invokes fn once per param, passing itself and the param", () => {
    const { utils } = createUtils();
    const fn = vi.fn();
    utils.multiple(fn, "a", "b", "c");
    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveBeenNthCalledWith(1, utils, "a");
    expect(fn).toHaveBeenNthCalledWith(3, utils, "c");
  });

  it("conditional() only invokes actions whose condition is true", () => {
    const { utils } = createUtils();
    const onTrue = vi.fn();
    const onFalse = vi.fn();
    utils.conditional([
      [onTrue, true],
      [onFalse, false],
    ]);
    expect(onTrue).toHaveBeenCalledWith(utils);
    expect(onFalse).not.toHaveBeenCalled();
  });
});
