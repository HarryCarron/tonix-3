import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import colors from "tailwindcss/colors";
import CanvasUtilities from "@/utils/canvas";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { trackGlobalMouseMove } from "@/utils/track-global-mouse-move";
import { ControlContainer } from "@/components/instruments/polysynth/ControlContainer";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterInteractionLayer } from "./FilterInteractionLayer";
import type { FilterType, FilterValue } from "./types";
import {
  DB_MAX,
  DB_MIN,
  FREQ_AXIS_TICKS,
  getFilterResponseDb,
  hzToNorm,
} from "./filter-response";
import "./Filter.css";

const PAD = 12;

export function Filter() {
  const [dims, setDims] = useState<{ width: number; height: number } | null>(
    null,
  );

  const [filterValues, setFilterValues] = useState<FilterValue>({
    freq: 0.5,
    q: 0.5,
    type: "BP",
  });

  const canvas = useRef<HTMLCanvasElement | null>(null);
  const container = useRef<HTMLDivElement | null>(null);
  const canvasUtils = useRef<CanvasUtilities | null>(null);

  useLayoutEffect(() => {
    if (container.current) {
      setDims({
        width: container.current.offsetWidth,
        height: container.current.offsetHeight,
      });
    }
  }, []);

  useEffect(() => {
    canvasUtils.current = new CanvasUtilities(
      canvas,
      PAD,
      PAD,
      container.current!.offsetWidth,
      container.current!.offsetHeight,
      true,
    )
      .setStyle({ lineCap: "round" })
      .setStyleProfiles({
        filterLine: {
          lineWidth: 2,
          strokeColor: colors.stone[500],
          lineDash: [0],
          lineJoin: "round",
        },
        filterGuide: {
          lineWidth: 1,
          strokeColor: colors.stone[300],
          lineDash: [2, 3],
        },
      });
  }, []);

  useEffect(() => {
    const utils = canvasUtils.current;
    if (!utils || !dims) return;

    const availableWidth = dims.width - PAD * 2;
    const availableHeight = dims.height - PAD * 2;

    const dbToY = (db: number) => {
      const clamped = Math.min(DB_MAX, Math.max(DB_MIN, db));
      return (
        PAD + (1 - (clamped - DB_MIN) / (DB_MAX - DB_MIN)) * availableHeight
      );
    };

    const responseDb = getFilterResponseDb(filterValues);
    const points = Array.from(responseDb, (db, i) => ({
      x: PAD + (i / (responseDb.length - 1)) * availableWidth,
      y: dbToY(db),
    }));

    utils
      .clear()
      .styleProfile("filterGuide")
      .line(PAD, dbToY(0), PAD + availableWidth, dbToY(0));

    for (const tick of FREQ_AXIS_TICKS) {
      const x = PAD + hzToNorm(tick.hz) * availableWidth;
      utils.styleProfile("filterGuide").line(x, PAD, x, PAD + availableHeight);
    }

    utils.styleProfile("filterLine").trackShape();
    for (let i = 0; i < points.length - 1; i++) {
      utils.line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    }
    utils.stopTrackingShape().drawShape(true, false);
  }, [filterValues, dims]);

  // x = freq, y = q - the point's vertical axis was freed up when gain was
  // dropped, so it now drives resonance instead of sitting idle
  const setFromClientPosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!canvasUtils.current) return;
      const [freq, q] = canvasUtils.current.getTrueCoordinates(
        clientX,
        clientY,
        true,
      );
      setFilterValues((state) => ({ ...state, freq, q }));
    },
    [],
  );

  const handleDragStart = (e: ReactMouseEvent) => {
    setFromClientPosition(e.clientX, e.clientY);
    trackGlobalMouseMove((moveEvent) =>
      setFromClientPosition(moveEvent.clientX, moveEvent.clientY),
    );
  };

  const availableWidth = (dims?.width ?? 0) - PAD * 2;
  const availableHeight = (dims?.height ?? 0) - PAD * 2;
  const handleX = availableWidth * filterValues.freq + PAD;
  const handleY = availableHeight - availableHeight * filterValues.q + PAD;

  return (
    <Card className="filter py-3 px-0 w-[280px]">
      <CardHeader>
        <span className="pix-font color-stone-500 text-4xl">Filter</span>
      </CardHeader>
      <CardContent className="px-3 flex flex-col gap-3">
        <div
          className="relative w-full h-[100px] border border-stone-200 rounded-md overflow-hidden bg-stone-100"
          ref={container}
        >
          <canvas height="0" width="0" ref={canvas}></canvas>
          <FilterInteractionLayer
            width={dims?.width ?? 0}
            height={dims?.height ?? 0}
            handleX={handleX}
            handleY={handleY}
            onDragStart={handleDragStart}
          />
        </div>

        <div className="flex justify-between text-xs text-stone-400">
          {FREQ_AXIS_TICKS.map((tick) => (
            <span key={tick.hz}>{tick.label}</span>
          ))}
        </div>

        <ControlContainer label="Type">
          <Select
            value={filterValues.type}
            onValueChange={(type) =>
              setFilterValues((state) => ({
                ...state,
                type: type as FilterType,
              }))
            }
          >
            <SelectTrigger className="w-full h-6 p-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Type</SelectLabel>
                <SelectItem value="LP">LP</SelectItem>
                <SelectItem value="HP">HP</SelectItem>
                <SelectItem value="BP">BP</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </ControlContainer>
      </CardContent>
    </Card>
  );
}

export default Filter;
