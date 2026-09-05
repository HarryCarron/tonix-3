import type { RefObject } from "react";

interface CanvasStyle {
  strokeColor?: string;
  lineWidth?: number;
  fillColor?: string;
  lineCap?: CanvasLineCap;
  lineDash?: number[];
  font?: string;
  textAlign?: CanvasTextAlign;
  fillStyle?: string;
  glow?: [number, string];
  // not read by setStyle's switch below, but real callers (e.g. Amp) pass it
  // as profile data
  opacity?: number;
}

interface ShapeSegment {
  line?: (params: number[]) => void;
  curve?: (params: number[]) => void;
  params: number[];
}

export default class CanvasUtilities {
  xPad: number = 0;
  yPad: number = 0;

  canvasWidth: number = 0;
  canvasHeight: number = 0;

  canvas!: RefObject<HTMLCanvasElement | null>;

  ctx!: CanvasRenderingContext2D;

  // never actually set anywhere; kept as an ambient declaration so the
  // (currently always-false) checks in line()/circle() still type-check
  declare relativeXPositioning: boolean;
  declare getRelativeXCoordinates: (x: number) => number;

  constructor(
    canvas: RefObject<HTMLCanvasElement | null>,
    xPad: number,
    yPad: number,
    width: number,
    height: number,
    setCanvasDims: boolean,
  ) {
    this.xPad = xPad;
    this.yPad = yPad;
    this.initCanvas(canvas, width, height, setCanvasDims);
    this.canvasWidth = width;
    this.canvasHeight = height;
    return this;
  }

  shape: ShapeSegment[] = [];
  trackingShape = false;

  styleProfiles: Record<string, CanvasStyle> = {};

  clear() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    return this;
  }

  setStyleProfiles(profiles: Record<string, CanvasStyle> = {}) {
    this.styleProfiles = profiles;
    return this;
  }

  trackShape() {
    this.trackingShape = true;
    return this;
  }

  stopTrackingShape() {
    this.trackingShape = false;
    return this;
  }

  drawShape(clear: boolean, close: boolean) {
    this.ctx.beginPath();

    let startingPoint: [number, number] | undefined;

    this.shape.forEach((def, i) => {
      const action = def.line ?? def.curve;

      if (!i) {
        if (def.line) {
          startingPoint = def.params.slice(0, 2) as [number, number];
        } else if (def.curve) {
          startingPoint = def.params.slice(0, 2) as [number, number];
        }
        this.ctx.moveTo(...startingPoint!);
      }

      action!(def.params);
      this.ctx.strokeStyle = "rgba(0,0,0,0)";
      this.ctx.stroke();
    });

    if (close) {
      this.ctx.closePath();
    }

    if (clear) {
      this.shape = [];
    }
    return this;
  }

  styleProfile(profileKey: string) {
    if (this.styleProfiles[profileKey]) {
      this.setStyle(this.styleProfiles[profileKey]);
    } else {
      console.error(`${profileKey} is not a recognised profile key!`);
    }
    return this;
  }

  setStyle(styles: CanvasStyle) {
    (Object.keys(styles) as Array<keyof CanvasStyle>).forEach((key) => {
      const value = styles[key];
      switch (key) {
        case "strokeColor":
          this.ctx.strokeStyle = value as string;
          break;
        case "lineWidth":
          this.ctx.lineWidth = value as number;
          break;
        case "fillColor":
          this.ctx.fillStyle = value as string;
          break;
        case "lineCap":
          this.ctx.lineCap = value as CanvasLineCap;
          break;
        case "lineDash":
          this.ctx.setLineDash(value as number[]);
          break;
        case "font":
          this.ctx.font = value as string;
          break;
        case "textAlign":
          this.ctx.textAlign = value as CanvasTextAlign;
          break;
        case "fillStyle":
          this.ctx.fillStyle = value as string;
          break;
        case "glow": {
          const [blur, color] = value as [number, string];
          this.ctx.shadowBlur = blur;
          this.ctx.shadowColor = color;
          break;
        }

        default:
      }
    });

    return this;
  }

  text(text: string, x: number, y: number) {
    this.ctx.fillText(text, x, y);
    return this;
  }

  // fn's actual runtime call shape is fn(this, param); left as any since
  // callers currently pass a variety of (mismatched) fn/param shapes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  multiple(fn: (self: any, param: any) => void, ...params: any[]) {
    params.forEach((param) => fn(this, param));
    return this;
  }

  conditional(conditions: Array<[(self: this) => void, boolean]>) {
    conditions
      .filter((condition) => condition[1])
      .forEach((condition) => condition[0](this));
    return this;
  }

  line(x1: number, y1: number, x2: number, y2: number) {
    this.ctx.beginPath();

    if (this.relativeXPositioning) {
      x1 = this.getRelativeXCoordinates(x1);
      x2 = this.getRelativeXCoordinates(x2);
    }

    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);

    if (this.trackingShape) {
      this.shape.push({
        line: (params: number[]) => {
          this.ctx.lineTo(...(params.slice(2) as [number, number]));
        },
        params: [x1, y1, x2, y2],
      });
    }
    this.ctx.stroke();

    return this;
  }

  curve(
    startX: number,
    startY: number,
    cpX: number,
    cpY: number,
    endX: number,
    endY: number,
  ) {
    this.ctx.beginPath();

    this.ctx.moveTo(startX, startY);
    this.ctx.quadraticCurveTo(cpX, cpY, endX, endY);

    if (this.trackingShape) {
      this.shape.push({
        curve: (params: number[]) => {
          this.ctx.quadraticCurveTo(
            ...(params.slice(2) as [number, number, number, number]),
          );
        },
        params: [startX, startY, cpX, cpY, endX, endY],
      });
    }

    this.ctx.stroke();

    return this;
  }

  fill(colour: string) {
    this.ctx.fillStyle = colour;
    this.ctx.fill();
    return this;
  }

  gradientFill(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    colour1: string,
    colour2: string,
  ) {
    const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, colour1);
    gradient.addColorStop(1, colour2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    return this;
  }

  path(paths: number[][]) {
    this.ctx.beginPath();
    paths.forEach((path) => {
      this.ctx.bezierCurveTo(
        ...(path as [number, number, number, number, number, number]),
      );
      if (this.trackingShape) {
        this.shape.push({
          curve: (params: number[]) => {
            this.ctx.bezierCurveTo(
              ...(params as [number, number, number, number, number, number]),
            );
          },
          params: path,
        });
      }
    });
    this.ctx.stroke();

    return this;
  }

  rect(x: number, y: number, width: number, height: number, fill: boolean) {
    this.ctx.beginPath();
    if (fill) {
      this.ctx.fillRect(x, y, width, height);
      this.ctx.strokeRect(x, y, width, height);
    } else {
      this.ctx.rect(x, y, width, height);
    }
    this.ctx.stroke();
  }

  arcRect() {}

  circle(x: number, y: number, r: number) {
    if (this.relativeXPositioning) {
      x = this.getRelativeXCoordinates(x);
    }

    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2 * Math.PI);
    this.ctx.stroke();

    return this;
  }

  initCanvas(
    canvas: RefObject<HTMLCanvasElement | null>,
    width: number,
    height: number,
    setCanvasDims: boolean,
  ) {
    if (setCanvasDims) {
      canvas.current!.width = width * 3;
      canvas.current!.height = height * 3;
      canvas.current!.style.width = `${width}px`;
      canvas.current!.style.height = `${height}px`;
    }

    this.canvas = canvas;

    this.ctx = canvas.current!.getContext("2d")!;

    this.ctx.scale(3, 3);
  }

  getTrueCoordinates(clientX: number, clientY: number, validate = false) {
    const xTravel = this.canvasWidth - this.xPad * 2;
    const yTravel = this.canvasHeight - this.yPad * 2;
    const canvasBB = this.canvas.current!.getBoundingClientRect();
    const canvasTop = canvasBB.top;
    const canvasLeft = canvasBB.left;
    const relativeY = Math.floor(yTravel - (clientY - canvasTop - this.yPad));
    const relativeX = Math.floor(clientX - canvasLeft - this.xPad);

    let mappedX = relativeX / xTravel;
    let mappedY = relativeY / yTravel;

    if (validate) {
      [mappedX, mappedY] = [mappedX, mappedY].map((v) =>
        validate ? (v >= 1 ? 1 : v <= 0 ? 0 : v) : v,
      );
    }
    return [mappedX, mappedY];
  }
}
