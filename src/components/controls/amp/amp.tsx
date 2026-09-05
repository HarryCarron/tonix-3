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
import RotaryControl from "@/components/controls/rotary-control/RotaryControl";

interface ClientPosition {
  clientX: number;
  clientY: number;
}

// replaces the legacy GlobalEventHandlers.initiate(onMouseMove): arms
// window-level mousemove tracking that removes itself after one mouseup
function trackGlobalMouseMove(onMouseMove: (e: globalThis.MouseEvent) => void) {
  const stop = () => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", stop);
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", stop);
}

interface Line {
  // todo move to dedicated file
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Circle {
  // todo move to dedicated file
  x: number;
  y: number;
  r: number;
}

interface AmpEnvelope {
  // todo move to dedicated file
  attack: number;
  decay: number;
  sustain: number;
  sustainWidth: number;
  release: number;
}

interface AmpCurve {
  // todo move to dedicated file
  attackCurve: number;
  decayCurve: number;
  releaseCurve: number;
}

interface Handle {
  x: number;
  y: number;
}

interface InteractionPanel {
  x: number;
  width: number;
  handle: Handle;
}

type ADSR = AmpEnvelope & AmpCurve;

export function Amp() {
  const xPad = 10;
  const yPad = 10;

  const [, viewReady] = useState(false);

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

      viewReady(true);
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
          strokeColor: "grey",
          lineDash: [2, 3],
        },
        ampLine: {
          lineWidth: 2,
          strokeColor: "#E0E0E0",
          lineDash: [0],
        },
        ampLineFill: { fillColor: "grey", opacity: 0.4 },
        ampHandle: {
          lineWidth: 2,
          strokeColor: "#E0E0E0",
          fillColor: "#E0E0E08",
          lineDash: [],
        },
        baseLine: {
          lineWidth: 1,
          strokeColor: "grey",
          lineDash: [0],
        },
        valueGuideLine: {
          lineWidth: 1,
          strokeColor: "grey",
          lineDash: [2, 3],
        },
        valueText: { fillStyle: "#C3C3CE" },
      });
  }, []);

  const drawAmp = useCallback(() => {
    ampValues.current.sustainHeight =
      ampValues.current.floor -
      amp.sustain * (ampValues.current.height - yPad * 2);
    const getXpositions = () => {
      return [amp.attack, amp.decay, amp.sustainWidth, amp.release].map(
        (_, i, o) =>
          xPad +
          ampValues.current.totalXTravel *
            o.slice(0, i + 1).reduce((a, b) => a + b),
      );
    };
    const [attackX, decayX, sustainWidthX, releaseX] = getXpositions();
    const sustainHeight = ampValues.current.sustainHeight;
    const floor = ampValues.current.floor;
    const canvas = utils.current.canvas;
    canvas!
      .clear()
      .styleProfile("baseLine")
      .multiple(
        (ctx: CanvasUtilities, params: Line) => {
          const { x1, x2, y1, y2 } = params;
          ctx.line(x1, x2, y1, y2);
        },
        [xPad, floor, ampValues.current.width - xPad, floor],
        [xPad, floor, xPad, yPad],
      )
      .styleProfile("ampGuide")
      .multiple(
        (ctx: CanvasUtilities, params: Line) => {
          const { x1, x2, y1, y2 } = params;
          ctx.line(x1, x2, y1, y2);
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
            ctx.curve(
              attackX,
              yPad,
              decayX,
              yPad,
              decayX,
              sustainHeight,
            ),
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
        (ctx: CanvasUtilities, params: Circle) => {
          const { x, y, r } = params;
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

    if (currentCurve! && set!) {
      if (currentCurve === 2) {
        currentCurve = 0;
      } else {
        currentCurve = currentCurve + 1;
      }

      set();
    }
  };

  const get = (id: number) => {
    const sustainHeight = ampValues.current.sustainHeight;
    const all = [amp.attack, amp.decay, amp.sustainWidth, amp.release];
    const pointY = [
      yPad,
      sustainHeight,
      sustainHeight,
      ampValues.current.floor,
    ];

    const x =
      xPad +
      all.slice(0, id).reduce((a, b) => a + b, 0) *
        ampValues.current.totalXTravel;
    const width = all[id] * ampValues.current.totalXTravel;

    return {
      x,
      width,
      handle: {
        x: x + width,
        y: pointY[id],
      },
    };
  };

  return (
    <div className="amp-container shadow-4">
      <div className="canvas-layer h-100 d-flex-col styled">
        <div className="flex-1" ref={container}>
          <canvas height="0" width="0" ref={canvas}></canvas>
          <svg
            className="interaction-layer"
            height={ampValues.current.height}
            width={ampValues.current.width}
          >
            {[0, 1, 2, 3].map((i) =>
              interactionPanel(get(i), i, () => ampClicked(i)),
            )}
            {[0, 1, 2, 3].map((i) =>
              interactionHandle(get(i), i, (e) => onHandleDrag(e, i)),
            )}
          </svg>
        </div>
      </div>
      <div className="d-flex knob-row space-around w-100">
        <div className="control-container  envelope-knob flex-1">
          <div className="center-child-xy header-item"> Attack </div>
          <RotaryControl size="sm" />
        </div>
        <div className="control-container envelope-knob flex-1">
          <div className="center-child-xy header-item"> Decay </div>
          <RotaryControl size="sm" />
        </div>
        <div className="control-container  envelope-knob flex-1">
          <div className="center-child-xy header-item"> Sustain </div>
          <RotaryControl size="sm" />
        </div>
        <div className="control-container  envelope-knob flex-1">
          <div className="center-child-xy header-item"> Release </div>
          <RotaryControl size="sm" />
        </div>
      </div>
    </div>
  );
}

const interactionPanel = (
  { x, width }: InteractionPanel,
  i: number,
  onAmpClick: (e: MouseEvent<SVGRectElement>) => void,
) => <rect key={i} onClick={onAmpClick} x={x} width={width} y="0" />;

const interactionHandle = (
  { handle: { x, y } }: InteractionPanel,
  i: number,
  onHandleDrag: (e: MouseEvent<SVGCircleElement>) => void,
) => <circle key={i} onMouseDown={onHandleDrag} cx={x} cy={y} r="5" />;

export default Amp;
