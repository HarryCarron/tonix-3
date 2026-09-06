import {
  useEffect,
  useRef,
  useCallback,
  useState,
  useLayoutEffect,
  type MouseEvent,
} from "react";
import CanvasUtilities from "@/utils/canvas";
import "./amp.css";
import colors from "tailwindcss/colors";
import type { ADSR, AmpEnvelope, ClientPosition } from "./types";
import { computeStageXPositions } from "./stage-positions";
import { trackGlobalMouseMove } from "./track-global-mouse-move";
import { AmpInteractionLayer } from "./AmpInteractionLayer";
import { AdsrStats } from "./AdsrStats";

// matches CanvasUtilities.line's (x1, y1, x2, y2) signature
type LineParams = [x1: number, y1: number, x2: number, y2: number];

// matches CanvasUtilities.circle's (x, y, r) signature
type CircleParams = [x: number, y: number, r: number];

export function Amp() {
  const xPad = 10;
  const yPad = 10;

  // drives the interaction SVG's width/height in the JSX below; the other
  // measured values (floor, totalXTravel, sustainHeight, etc.) are only
  // read inside drawAmp's canvas math, so they stay in the ampValues ref
  const [dims, setDims] = useState<{ width: number; height: number } | null>(
    null,
  );

  const [amp, setAmp] = useState<ADSR>({
    attack: 0.1,
    attackCurve: 0,
    decay: 0.2,
    decayCurve: 0,
    sustain: 0.5,
    sustainWidth: 0.2,
    release: 0.3,
    releaseCurve: 0,
  });

  const utils = useRef<{
    canvas: CanvasUtilities | null;
  }>({
    canvas: null,
  });

  const ampValues = useRef({
    height: 0,
    width: 0,
    floor: 0,
    totalXTravel: 0,
    totalYTravel: 0,
    sustainWidth: 0,
    sustainHeight: 0,
  });

  const canvas = useRef<HTMLCanvasElement | null>(null);
  const container = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (container.current) {
      ampValues.current.totalXTravel = container.current.offsetWidth - xPad * 2;
      ampValues.current.totalYTravel =
        container.current.offsetHeight - yPad * 2;

      ampValues.current.floor = container.current.offsetHeight - yPad;

      ampValues.current.height = container.current.offsetHeight;
      ampValues.current.width = container.current.offsetWidth;

      setDims({
        width: container.current.offsetWidth,
        height: container.current.offsetHeight,
      });
    }
  }, []);

  useEffect(() => {
    utils.current.canvas = new CanvasUtilities(
      canvas,
      xPad,
      yPad,
      container.current!.offsetWidth,
      container.current!.offsetHeight,
      true,
    )
      .setStyle({
        lineCap: "round",
        textAlign: "center",
        font: "bold 7px Helvetica",
      })
      .setStyleProfiles({
        ampGuide: {
          lineWidth: 1,
          strokeColor: colors.stone[400],
          lineDash: [2, 3],
        },
        ampLine: {
          lineWidth: 2,
          strokeColor: colors.stone[500],
          lineDash: [0],
        },
        ampLineFill: { fillColor: colors.stone[300], opacity: 0.4 },
        ampHandle: {
          lineWidth: 2,
          strokeColor: colors.stone[500],
          fillColor: colors.stone[500],
          lineDash: [],
        },
        baseLine: {
          lineWidth: 1,
          strokeColor: colors.stone[400],
          lineDash: [0],
        },
        valueGuideLine: {
          lineWidth: 0.5,
          strokeColor: colors.stone[600],
          lineDash: [2, 3],
        },
        valueText: { fillStyle: "#C3C3CE" },
      });
  }, []);

  const drawAmp = useCallback(() => {
    ampValues.current.sustainHeight =
      ampValues.current.floor -
      amp.sustain * (ampValues.current.height - yPad * 2);
    const [attackX, decayX, sustainWidthX, releaseX] = computeStageXPositions(
      amp.attack,
      amp.decay,
      amp.sustainWidth,
      amp.release,
      xPad,
      ampValues.current.totalXTravel,
    );
    const sustainHeight = ampValues.current.sustainHeight;
    const floor = ampValues.current.floor;
    const canvas = utils.current.canvas;
    canvas!
      .clear()
      .styleProfile("baseLine")
      .multiple(
        (ctx: CanvasUtilities, params: LineParams) => {
          const [x1, y1, x2, y2] = params;
          ctx.line(x1, y1, x2, y2);
        },
        [xPad, floor, ampValues.current.width - xPad, floor],
        [xPad, floor, xPad, yPad],
      )
      .styleProfile("ampGuide")
      .multiple(
        (ctx: CanvasUtilities, params: LineParams) => {
          const [x1, y1, x2, y2] = params;
          ctx.line(x1, y1, x2, y2);
        },
        [attackX, floor, attackX, yPad],
        [decayX, floor, decayX, yPad],
        [sustainWidthX, floor, sustainWidthX, yPad],
        [releaseX, floor, releaseX, yPad],
      )
      .styleProfile("ampLine")
      .trackShape()
      .conditional([
        // attack
        [
          (ctx: CanvasUtilities) => ctx.line(xPad, floor, attackX, yPad),
          amp.attackCurve === 0,
        ],
        [
          (ctx: CanvasUtilities) =>
            ctx.curve(xPad, floor, attackX, floor, attackX, yPad),
          amp.attackCurve === 1,
        ],
        [
          (ctx: CanvasUtilities) =>
            ctx.curve(xPad, floor, xPad, yPad, attackX, yPad),
          amp.attackCurve === 2,
        ],
        // decay
        [
          (ctx: CanvasUtilities) =>
            ctx.line(attackX, yPad, decayX, sustainHeight),
          amp.decayCurve === 0,
        ],
        [
          (ctx: CanvasUtilities) =>
            ctx.curve(
              attackX,
              yPad,
              attackX,
              sustainHeight,
              decayX,
              sustainHeight,
            ),
          amp.decayCurve === 1,
        ],
        [
          (ctx: CanvasUtilities) =>
            ctx.curve(attackX, yPad, decayX, yPad, decayX, sustainHeight),
          amp.decayCurve === 2,
        ],
        // sustain
        [
          (ctx: CanvasUtilities) =>
            ctx.line(decayX, sustainHeight, sustainWidthX, sustainHeight),
          true,
        ],
        // release
        [
          (ctx: CanvasUtilities) =>
            ctx.line(sustainWidthX, sustainHeight, releaseX, floor),
          amp.releaseCurve === 0,
        ],
        [
          (ctx: CanvasUtilities) =>
            ctx.curve(
              sustainWidthX,
              sustainHeight,
              sustainWidthX,
              floor,
              releaseX,
              floor,
            ),
          amp.releaseCurve === 1,
        ],
        [
          (ctx: CanvasUtilities) =>
            ctx.curve(
              sustainWidthX,
              sustainHeight,
              releaseX,
              sustainHeight,
              releaseX,
              floor,
            ),
          amp.releaseCurve === 2,
        ],
      ])
      .stopTrackingShape()
      .drawShape(true, true)
      .gradientFill(
        175,
        0,
        175,
        80,
        "rgba(255, 255, 255, 0.2)",
        "rgba(255, 255, 255, 0.2)",
      )
      .styleProfile("ampHandle")
      .multiple(
        (ctx: CanvasUtilities, params: CircleParams) => {
          const [x, y, r] = params;
          ctx.circle(x, y, r);
        },
        [attackX, yPad, 2],
        [decayX, sustainHeight, 2],
        [sustainWidthX, sustainHeight, 2],
        [releaseX, floor, 2],
      );
  }, [
    amp.attack,
    amp.attackCurve,
    amp.decay,
    amp.decayCurve,
    amp.release,
    amp.releaseCurve,
    amp.sustain,
    amp.sustainWidth,
  ]);

  useEffect(() => drawAmp(), [drawAmp]);

  const validateValue = (v: number) => {
    if (v >= 1) {
      return 1;
    }
    if (v <= 0) {
      return 0;
    }

    return v;
  };

  const widthValid = (amp: AmpEnvelope) => {
    return (
      [amp.attack, amp.decay, amp.sustainWidth, amp.release].reduce(
        (a, b) => a + b,
      ) < 1
    );
  };

  const handleClick = ({ clientX, clientY }: ClientPosition, i: number) => {
    if (!(clientX && clientY)) {
      return;
    }
    const [x, y] = utils.current.canvas!.getTrueCoordinates(clientX, clientY);

    switch (i) {
      case 0: {
        const attack = validateValue(x);
        setAmp((state) => {
          if (widthValid({ ...state, attack })) {
            return { ...state, attack };
          }
          return state;
        });
        break;
      }
      case 1: {
        const decay = validateValue(x - amp.attack);
        const sustain = validateValue(y);
        setAmp((state) => {
          if (widthValid({ ...state, decay })) {
            return { ...state, decay };
          }
          return state;
        });
        setAmp((state) => ({ ...state, sustain }));
        break;
      }
      case 2: {
        const sustainWidth = validateValue(x - (amp.attack + amp.decay));
        const sustain = validateValue(y);

        setAmp((state) => {
          if (widthValid({ ...state, sustainWidth })) {
            return { ...state, sustainWidth };
          }
          return state;
        });

        setAmp((state) => ({ ...state, sustain }));

        break;
      }
      case 3: {
        const release = validateValue(
          x - (amp.attack + amp.decay + amp.sustainWidth),
        );
        setAmp((state) => {
          if (widthValid({ ...state, release })) {
            return { ...state, release };
          }
          return state;
        });
        break;
      }
      default:
        return;
    }
  };

  const onHandleDrag = (e: MouseEvent<SVGCircleElement>, i: number) => {
    handleClick(e, i);
    trackGlobalMouseMove((e) => handleClick(e, i));
  };

  const ampClicked = (i: number) => {
    let currentCurve: number;
    let set: () => void;
    switch (i) {
      case 0: {
        currentCurve = amp.attackCurve;
        set = () => setAmp({ ...amp, attackCurve: currentCurve });
        break;
      }
      case 1: {
        currentCurve = amp.decayCurve;
        set = () => setAmp({ ...amp, decayCurve: currentCurve });
        break;
      }
      case 3: {
        currentCurve = amp.releaseCurve;
        set = () => setAmp({ ...amp, releaseCurve: currentCurve });
        break;
      }
      default:
        return;
    }

    // every case above either returns or assigns both currentCurve and set,
    // so both are always assigned by this point (0 is a valid curve here,
    // so this can't be a truthiness check on currentCurve)
    if (currentCurve === 2) {
      currentCurve = 0;
    } else {
      currentCurve = currentCurve + 1;
    }

    set();
  };

  const get = (id: number) => {
    const sustainHeight = ampValues.current.sustainHeight;
    const pointY = [
      yPad,
      sustainHeight,
      sustainHeight,
      ampValues.current.floor,
    ];

    const xPositions = computeStageXPositions(
      amp.attack,
      amp.decay,
      amp.sustainWidth,
      amp.release,
      xPad,
      ampValues.current.totalXTravel,
    );
    const x = id === 0 ? xPad : xPositions[id - 1];
    const width = xPositions[id] - x;

    return {
      x,
      width,
      handle: {
        x: xPositions[id],
        y: pointY[id],
      },
    };
  };

  return (
    <div className="h-full w-full shadow-4 flex flex-col">
      <div className="flex-1 min-h-0 flex flex-col styled">
        <div className="flex-1 w-full relative" ref={container}>
          <canvas height="0" width="0" ref={canvas}></canvas>
          <AmpInteractionLayer
            width={dims?.width ?? 0}
            height={dims?.height ?? 0}
            get={get}
            onStageClick={ampClicked}
            onHandleDrag={onHandleDrag}
          />
        </div>
      </div>

      <AdsrStats amp={amp} />
    </div>
  );
}

export default Amp;
