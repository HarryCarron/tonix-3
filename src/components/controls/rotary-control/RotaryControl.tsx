import { useRef, useEffect, useState } from "react";
import { DragAndDrop } from "./../../../utils/drag-and-drop";
import "./RotaryControl.css";
import { Input } from "../../ui/input";

// Angle convention throughout this file: 0deg = up, increasing clockwise.
const TRACK_START_ANGLE = 210;
const TRACK_SWEEP_ANGLE = 300;

// pixels of vertical drag needed to sweep the value from 0 to 1
const DRAG_PX_PER_FULL_SWEEP = 100;

export type RotaryControlSize = "sm" | "md";

const SIZE_PX: Record<RotaryControlSize, number> = {
  sm: 23,
  md: 40,
};

interface RotaryControlProps {
  size?: RotaryControlSize;
  // optionally-controlled: pass both to drive the value externally (e.g.
  // from Amp's envelope state); omit both to let RotaryControl own its
  // own value internally (e.g. Polysynth's oscillator knobs)
  value?: number;
  onChange?: (value: number) => void;
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
}

function valueToAngle(value: number) {
  return TRACK_START_ANGLE + value * TRACK_SWEEP_ANGLE;
}

export default function RotaryControl({
  size = "sm",
  value: controlledValue,
  onChange,
}: RotaryControlProps) {
  const rotaryControl = useRef<SVGSVGElement | null>(null);

  const ddRef = useRef<DragAndDrop | null>(null);

  const lastYRef = useRef<number | null>(null);

  const sizePx = SIZE_PX[size];

  const [internalValue, setInternalValue] = useState(0.5);

  const value = controlledValue ?? internalValue;

  // read by the drag handler below, which is registered once on mount and
  // otherwise wouldn't see updates to `value`/`onChange`
  const valueRef = useRef(value);
  valueRef.current = value;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const dd = new DragAndDrop().setHost(rotaryControl.current!);

    dd.listen(({ type, e }) => {
      const clientY = (e as MouseEvent).clientY;

      if (type === "start") {
        lastYRef.current = clientY;
        return;
      }

      if (type === "dragging") {
        // dragging up increases the value, so invert the raw screen delta
        const deltaY = lastYRef.current! - clientY;
        lastYRef.current = clientY;

        const next = Math.min(
          1,
          Math.max(0, valueRef.current + deltaY / DRAG_PX_PER_FULL_SWEEP),
        );

        if (onChangeRef.current) {
          onChangeRef.current(next);
        } else {
          setInternalValue(next);
        }
      }
    });

    ddRef.current = dd;

    return () => {
      ddRef.current?.done();
    };
  }, []);

  const valueAngle = valueToAngle(value);

  return (
    <div style={{ width: sizePx + 17 }}>
      <div className="flex flex-col mb-2">
        <div className="flex text-sm justify-center align-center">
          <Input className="p-2 h-6" value={(value * 100).toFixed(0)} />
        </div>
      </div>

      <div className="flex justify-center">
        <svg
          className="overflow-visible"
          height={sizePx}
          width={sizePx}
          ref={rotaryControl}
        >
          <path
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            className="stroke-stone-300"
            d={describeArc(
              sizePx / 2,
              sizePx / 2,
              sizePx / 2,
              TRACK_START_ANGLE,
              TRACK_START_ANGLE + TRACK_SWEEP_ANGLE,
            )}
          />

          <path
            fill="none"
            className="stroke-stone-800"
            strokeWidth="2"
            strokeLinecap="round"
            d={describeArc(
              sizePx / 2,
              sizePx / 2,
              sizePx / 2,
              TRACK_START_ANGLE,
              valueAngle,
            )}
          />
          <g
            className="grabbable rotating-component"
            style={{ transform: `rotate(${valueAngle - 180}deg)` }}
          >
            <circle
              cx={sizePx / 2}
              cy={sizePx / 2}
              r={sizePx / 2}
              fill="transparent"
            />
            <line
              x1={sizePx / 2}
              y1={sizePx - 6}
              x2={sizePx / 2}
              y2={sizePx}
              strokeWidth="2"
              strokeLinecap="round"
              stroke="black"
            ></line>
          </g>
        </svg>
      </div>
    </div>
  );
}
