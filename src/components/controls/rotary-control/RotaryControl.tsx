import { useRef, useEffect, useState } from "react";
import { DragAndDrop } from "./../../../utils/drag-and-drop";
import "./RotaryControl.css";
import { Input } from "../../ui/input";

// Angle convention throughout this file: 0deg = up, increasing clockwise.
const TRACK_START_ANGLE = 210;
const TRACK_SWEEP_ANGLE = 300;

// pixels of vertical drag to sweep 0-1 (continuous) or first-to-last stage (staged)
const DRAG_PX_PER_FULL_SWEEP = 100;

export type RotaryControlSize = "sm" | "md";

const SIZE_PX: Record<RotaryControlSize, number> = {
  sm: 23,
  md: 40,
};

export interface RotaryControlStage {
  value: string; // e.g. a Tone.js Time notation string like "8n"
  label: string; // e.g. "1/8"
}

interface RotaryControlContinuousProps {
  mode?: "continuous";
  size?: RotaryControlSize;
  // optionally-controlled: pass both to drive the value externally (e.g.
  // from Amp's envelope state); omit both to let RotaryControl own its
  // own value internally (e.g. Polysynth's oscillator knobs)
  value?: number;
  onChange?: (value: number) => void;
}

interface RotaryControlStagedProps {
  mode: "staged";
  size?: RotaryControlSize;
  stages: RotaryControlStage[];
  value?: string;
  onChange?: (value: string) => void;
}

type RotaryControlProps =
  | RotaryControlContinuousProps
  | RotaryControlStagedProps;

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

function stageAngle(index: number, count: number) {
  if (count <= 1) return TRACK_START_ANGLE;
  return TRACK_START_ANGLE + (index / (count - 1)) * TRACK_SWEEP_ANGLE;
}

export default function RotaryControl(props: RotaryControlProps) {
  const { size = "sm" } = props;
  const isStaged = props.mode === "staged";
  const stages = isStaged ? props.stages : undefined;

  const rotaryControl = useRef<SVGSVGElement | null>(null);

  const ddRef = useRef<DragAndDrop | null>(null);

  const lastYRef = useRef<number | null>(null);

  // the value in continuous mode; quantized to a stage index in staged mode
  const rawRef = useRef(0.5);

  const lastStageIndexRef = useRef(0);

  const sizePx = SIZE_PX[size];

  const [internalContinuousValue, setInternalContinuousValue] = useState(0.5);
  const [internalStagedValue, setInternalStagedValue] = useState<
    string | undefined
  >(undefined);

  const continuousValue = !isStaged
    ? (props.value ?? internalContinuousValue)
    : 0;

  const stagedValue = isStaged
    ? (props.value ?? internalStagedValue ?? stages![0]?.value)
    : undefined;

  const stageIndex =
    isStaged && stages
      ? Math.max(
          0,
          stages.findIndex((stage) => stage.value === stagedValue),
        )
      : 0;

  // refs so the drag handler (registered once on mount) sees prop/state updates
  const modeRef = useRef(props.mode ?? "continuous");
  modeRef.current = props.mode ?? "continuous";

  const continuousValueRef = useRef(continuousValue);
  continuousValueRef.current = continuousValue;

  const stageIndexRef = useRef(stageIndex);
  stageIndexRef.current = stageIndex;

  const stagesRef = useRef(stages);
  stagesRef.current = stages;

  const onChangeContinuousRef = useRef<((value: number) => void) | undefined>(
    undefined,
  );
  onChangeContinuousRef.current = !isStaged ? props.onChange : undefined;

  const onChangeStagedRef = useRef<((value: string) => void) | undefined>(
    undefined,
  );
  onChangeStagedRef.current = isStaged ? props.onChange : undefined;

  useEffect(() => {
    const dd = new DragAndDrop().setHost(rotaryControl.current!);

    dd.listen(({ type, e }) => {
      const clientY = (e as MouseEvent).clientY;

      if (type === "start") {
        lastYRef.current = clientY;

        // reseed from the current stage so the drag doesn't jump from a stale rawRef
        const stagesNow = stagesRef.current;
        rawRef.current =
          modeRef.current === "staged" && stagesNow && stagesNow.length > 1
            ? stageIndexRef.current / (stagesNow.length - 1)
            : continuousValueRef.current;

        lastStageIndexRef.current = stageIndexRef.current;
        return;
      }

      if (type === "dragging") {
        // dragging up increases the value, so invert the raw screen delta
        const deltaY = lastYRef.current! - clientY;
        lastYRef.current = clientY;

        const next = Math.min(
          1,
          Math.max(0, rawRef.current + deltaY / DRAG_PX_PER_FULL_SWEEP),
        );
        rawRef.current = next;

        if (modeRef.current === "staged") {
          const stagesNow = stagesRef.current;
          if (!stagesNow || stagesNow.length === 0) return;

          const nextIndex = Math.round(next * (stagesNow.length - 1));

          if (nextIndex === lastStageIndexRef.current) return;
          lastStageIndexRef.current = nextIndex;

          const nextValue = stagesNow[nextIndex].value;

          if (onChangeStagedRef.current) {
            onChangeStagedRef.current(nextValue);
          } else {
            setInternalStagedValue(nextValue);
          }
        } else {
          if (onChangeContinuousRef.current) {
            onChangeContinuousRef.current(next);
          } else {
            setInternalContinuousValue(next);
          }
        }
      }
    });

    ddRef.current = dd;

    return () => {
      ddRef.current?.done();
    };
  }, []);

  const valueAngle =
    isStaged && stages
      ? stageAngle(stageIndex, stages.length)
      : valueToAngle(continuousValue);

  const progress = (valueAngle - TRACK_START_ANGLE) / TRACK_SWEEP_ANGLE;

  const readoutText = isStaged
    ? (stages?.[stageIndex]?.label ?? "")
    : (continuousValue * 100).toFixed(0);

  return (
    <div style={{ width: sizePx + 17 }}>
      <div className="flex flex-col mb-2">
        <div className="flex text-sm justify-center align-center">
          <Input className="p-2 h-6" value={readoutText} />
        </div>
      </div>

      <div className="flex justify-center">
        <svg
          className="overflow-visible"
          height={sizePx}
          width={sizePx}
          ref={rotaryControl}
        >
          {isStaged &&
            stages?.map((stage, i) => {
              const angle = stageAngle(i, stages.length);
              const inner = polarToCartesian(
                sizePx / 2,
                sizePx / 2,
                sizePx / 2,
                angle,
              );
              const outer = polarToCartesian(
                sizePx / 2,
                sizePx / 2,
                sizePx / 2 + 4,
                angle,
              );
              const active = i === stageIndex;

              return (
                <line
                  key={stage.value}
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={active ? "stroke-stone-800" : "stroke-stone-300"}
                />
              );
            })}
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
            className="stroke-stone-800 value-arc"
            strokeWidth="2"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={progress - 1}
            d={describeArc(
              sizePx / 2,
              sizePx / 2,
              sizePx / 2,
              TRACK_START_ANGLE,
              TRACK_START_ANGLE + TRACK_SWEEP_ANGLE,
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
