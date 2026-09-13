import { useEffect, useId, useLayoutEffect, useRef } from "react";
import colors from "tailwindcss/colors";

// matches every other canvas in the codebase (utils/canvas.tsx's initCanvas)
const PIXEL_SCALE = 3;

const FILL_COLOR = colors.stone[500];

// "midi" dot geometry, relative to the meter's thickness (the fixed
// cross-axis dimension - width for vertical, height for horizontal)
const DOT_DIAMETER_RATIO = 0.6;
const DOT_PITCH_RATIO = 1.15;

export interface MeterProps {
  // pulled every animation frame rather than passed as a prop value, so a
  // fast-changing signal (MIDI velocity, an audio-rate analyser tap) never
  // triggers a React re-render - see repo issue #32
  getValue: () => number;
  orientation?: "vertical" | "horizontal";
  // "analog" is a solid continuous bar; "midi" overlays a stack of
  // transparent dots (Ableton-style LED ladder) so the same continuous
  // value reads as segmented - the underlying value is never quantized,
  // only how it's revealed is
  type?: "analog" | "midi";
  className?: string;
}

export function Meter({
  getValue,
  orientation = "vertical",
  type = "analog",
  className,
}: MeterProps) {
  const maskId = useId();
  const container = useRef<HTMLDivElement | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const dims = useRef({ width: 0, height: 0 });
  const dotPattern = useRef<SVGPatternElement | null>(null);
  const dotCircle = useRef<SVGCircleElement | null>(null);

  const getValueRef = useRef(getValue);
  useEffect(() => {
    getValueRef.current = getValue;
  }, [getValue]);

  useLayoutEffect(() => {
    if (!container.current || !canvas.current) return;

    const width = container.current.offsetWidth;
    const height = container.current.offsetHeight;
    dims.current = { width, height };

    canvas.current.width = width * PIXEL_SCALE;
    canvas.current.height = height * PIXEL_SCALE;
    canvas.current.style.width = `${width}px`;
    canvas.current.style.height = `${height}px`;

    const context = canvas.current.getContext("2d");
    if (context) {
      context.scale(PIXEL_SCALE, PIXEL_SCALE);
      ctx.current = context;
    }

    if (dotPattern.current && dotCircle.current) {
      const thickness = orientation === "vertical" ? width : height;
      const pitch = thickness * DOT_PITCH_RATIO;
      const tileWidth = orientation === "vertical" ? width : pitch;
      const tileHeight = orientation === "vertical" ? pitch : height;

      dotPattern.current.setAttribute("width", String(tileWidth));
      dotPattern.current.setAttribute("height", String(tileHeight));
      dotCircle.current.setAttribute("cx", String(tileWidth / 2));
      dotCircle.current.setAttribute("cy", String(tileHeight / 2));
      dotCircle.current.setAttribute(
        "r",
        String((thickness * DOT_DIAMETER_RATIO) / 2),
      );
    }
  }, [orientation]);

  useEffect(() => {
    let rafId: number;

    const tick = () => {
      const context = ctx.current;
      if (context) {
        const { width, height } = dims.current;
        const value = Math.min(1, Math.max(0, getValueRef.current()));

        context.clearRect(0, 0, width, height);
        context.fillStyle = FILL_COLOR;

        if (orientation === "vertical") {
          const barHeight = height * value;
          context.fillRect(0, height - barHeight, width, barHeight);
        } else {
          const barWidth = width * value;
          context.fillRect(0, 0, barWidth, height);
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [orientation]);

  return (
    <div
      ref={container}
      className={`relative w-full h-full overflow-hidden rounded-md border border-stone-300 ${className ?? ""}`}
    >
      <canvas ref={canvas} />
      {type === "midi" && (
        <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
          <defs>
            <pattern
              ref={dotPattern}
              id={maskId}
              patternUnits="userSpaceOnUse"
              width={1}
              height={1}
            >
              <rect x={-1000} y={-1000} width={2000} height={2000} fill="white" />
              <circle ref={dotCircle} r={0} fill="black" />
            </pattern>
            <mask id={`${maskId}-mask`}>
              <rect width="100%" height="100%" fill={`url(#${maskId})`} />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            className="fill-card"
            mask={`url(#${maskId}-mask)`}
          />
        </svg>
      )}
    </div>
  );
}
