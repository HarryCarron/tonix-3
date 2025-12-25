import { useRef, useEffect } from "react";
import { DragAndDrop } from "./../../../utils/drag-and-drop";
import "./RotaryControl.css";
import { Input } from "@/components/ui/input";

export default function RotaryControl() {
  const rotaryControl = useRef<SVGSVGElement | null>(null);

  const size = 23;

  const value = 0.5;

  useEffect(() => {
    new DragAndDrop<SVGSVGElement>(
      rotaryControl.current!,
      () => {},
      () => {}
    );
  }, []);

  function polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
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
    endAngle: number
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

  return (
    <div className="w-[40px]">
      <div className="flex flex-col mb-2">
        <div className="flex text-sm justify-center align-center">
          <Input className="p-2 h-6" value={(value * 100).toFixed(0)} />
        </div>
      </div>

      <div className="flex justify-center">
        <svg
          className="overflow-visible"
          height={size}
          width={size}
          ref={rotaryControl}
        >
          <path
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            className="stroke-stone-300"
            d={describeArc(size / 2, size / 2, size / 2, 210, 510)}
          />

          <path
            fill="none"
            className="stroke-stone-800"
            strokeWidth="2"
            strokeLinecap="round"
            d={describeArc(
              size / 2,
              size / 2,
              size / 2,
              210,
              210 + value * 300
            )}
          />
          <g
            className="grabbable rotating-component"
            style={{ transform: `rotate(${30 + value * 300}deg)` }}
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={size / 2}
              fill="transparent"
            />
            <line
              x1={size / 2}
              y1={size - 6}
              x2={size / 2}
              y2={size}
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
