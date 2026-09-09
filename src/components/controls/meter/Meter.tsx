import { useEffect, useLayoutEffect, useRef } from "react";
import colors from "tailwindcss/colors";

// matches every other canvas in the codebase (utils/canvas.tsx's initCanvas)
const PIXEL_SCALE = 3;

const FILL_COLOR = colors.stone[500];

export interface MeterProps {
  // pulled every animation frame rather than passed as a prop value, so a
  // fast-changing signal (MIDI velocity, an audio-rate analyser tap) never
  // triggers a React re-render - see repo issue #32
  getValue: () => number;
  orientation?: "vertical" | "horizontal";
  className?: string;
}

export function Meter({
  getValue,
  orientation = "vertical",
  className,
}: MeterProps) {
  const container = useRef<HTMLDivElement | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const dims = useRef({ width: 0, height: 0 });

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
    if (!context) return;
    context.scale(PIXEL_SCALE, PIXEL_SCALE);
    ctx.current = context;
  }, []);

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
    </div>
  );
}
