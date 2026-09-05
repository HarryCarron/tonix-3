import { useCallback, useEffect, useRef, useState } from "react";
import "./additive.css";
import { FaPlus, FaMinus } from "react-icons/fa";
import { DragAndDrop } from "@/utils/drag-and-drop";
import CanvasUtilities from "@/utils/canvas";
import { Button } from "@/components/ui/button";

const PARTIALS_UPPER_LIMIT = 32;
const TOOL_BAR_HEIGHT = 25;

interface Utilities {
  canvas: CanvasUtilities | undefined;
}

// matches CanvasUtilities.rect's (x, y, width, height, fill) signature
type RectParams = [x: number, y: number, w: number, h: number, fill: boolean];

export default function Additive() {
  const xPad = 8;
  const yPad = 12;

  const canvas = useRef<HTMLCanvasElement | null>(null);
  const container = useRef<HTMLDivElement | null>(null);

  const ddRef = useRef<DragAndDrop | null>(null);

  const [partials, setPartials] = useState([1]);

  const partialsRef = useRef(partials);
  partialsRef.current = partials;

  const utils = useRef<Utilities>({
    canvas: undefined,
  });

  const renderValues = useRef({
    totalXTravel: 0,
    totalYTravel: 0,
    floor: 0,
  });

  const incrementPartial = (mode: boolean) => {
    const newPartials = [...partials];
    if (mode) {
      newPartials.push(1);
    } else {
      newPartials.pop();
    }

    if (newPartials.length <= PARTIALS_UPPER_LIMIT && newPartials.length >= 0) {
      setPartials(() => newPartials);
    }
  };

  const randomize = () => {
    const length = Math.floor(Math.random() * PARTIALS_UPPER_LIMIT);
    const partials = Array.from({ length }).map(() => Math.random());
    setPartials(() => partials);
  };

  const clear = () => {
    setPartials(() => []);
  };

  // reads partialsRef rather than closing over `partials` directly, so this
  // stays a stable callback and the DragAndDrop listener only needs to be
  // registered once (see the mount effect below)
  const manipulatePartial = useCallback((e: MouseEvent) => {
    const { clientX, clientY } = e;

    if (!(clientX && clientY)) {
      return;
    }

    const [x, y] = utils.current.canvas!.getTrueCoordinates(
      clientX,
      clientY,
      true,
    );

    const currentPartials = partialsRef.current;
    const hoveredPartial = Math.floor(x * currentPartials.length);

    if (hoveredPartial >= currentPartials.length) {
      return;
    }

    setPartials((state) => {
      const newState = [...state];
      newState[hoveredPartial] = y;
      return newState;
    });
  }, []);

  useEffect(() => {
    renderValues.current.totalXTravel =
      container.current!.offsetWidth - xPad * 2;
    renderValues.current.totalYTravel = container.current!.offsetHeight - yPad;
    renderValues.current.floor = container.current!.offsetHeight - yPad / 2;

    utils.current.canvas = new CanvasUtilities(
      canvas,
      xPad,
      yPad,
      container.current!.offsetWidth,
      container.current!.offsetHeight,
      true,
    );
    utils.current.canvas.setStyle({
      fillStyle: "#3e3e3e",
      strokeColor: "#c7c7c7",
      lineWidth: 1,
    });

    const dd = new DragAndDrop().setHost(canvas.current!);

    dd.listen(({ type, e }) => {
      if (type !== "done") {
        manipulatePartial(e as MouseEvent);
      }
    });

    ddRef.current = dd;

    return () => {
      ddRef.current?.done();
    };
  }, [manipulatePartial]);

  useEffect(() => {
    utils.current.canvas!.clear();
    const totalPartialsNumber = partials.length;
    const width = renderValues.current.totalXTravel / totalPartialsNumber;
    const partialPad = 3;
    utils.current.canvas!.multiple(
      (ctx: CanvasUtilities, params: RectParams) => {
        const [x, y, w, h, fill] = params;
        ctx.rect(x, y, w, h, fill);
      },
      ...partials.map((partial, i): RectParams => {
        const x = xPad + width * i + partialPad / 2;
        const y = renderValues.current.floor;
        const partialWidth = width - partialPad;
        const height = renderValues.current.totalYTravel * partial * -1;
        return [x, y, partialWidth, height, true];
      }),
    );
  }, [partials]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0" ref={container}>
        <canvas ref={canvas} height="0" width="0"></canvas>
      </div>

      <div className="border-t border-stone-300 flex p-2">
        <div className="flex gap-2">
          <Button size="sm" onClick={() => randomize()}>
            Randomize
          </Button>
          <Button size="sm" onClick={() => clear()}>
            Clear
          </Button>

          <Button size="sm" onClick={() => incrementPartial(false)}>
            <FaMinus className="pointer" />
          </Button>

          <Button size="sm" onClick={() => incrementPartial(true)}>
            <FaPlus className="pointer" />
          </Button>
        </div>
      </div>
    </div>
  );
}
