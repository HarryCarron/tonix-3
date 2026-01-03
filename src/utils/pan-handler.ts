import { Coords } from "@/types/global/Coords";
import { BaseHandler } from "./base-handler";

export type PanPayload = [Coords, Coords];

type PanChangeHandler = (t: string) => void;

export class PanHandler extends BaseHandler<Coords> {
  private _origin = new Coords();

  private _previous = new Coords();

  private _changeFn: PanChangeHandler | undefined;

  private _mouseMove!: (e: MouseEvent) => void;

  private _mouseUp!: (e?: MouseEvent) => void;

  private _mouseDown!: (e: MouseEvent) => void;

  private _doneFn?: (p: Coords) => void;

  private _host!: HTMLElement;

  constructor() {
    super();

    this._mouseMove = this.__mouseMove.bind(this);
    this._mouseUp = this.__mouseUp.bind(this);
    this._mouseDown = this.__mouseDown.bind(this);
  }

  private __mouseMove(e: MouseEvent): void {
    const delta = this.calculateRelPos(this._origin, this._extract(e));
    const pan = this._prepare(delta);

    this._emit(pan);
  }

  private __mouseUp(e?: MouseEvent): void {
    if (e) {
      this._persist(e);
      this._doneFn?.(this._previous);
    }
    this._host.removeEventListener("mousemove", this._mouseMove);
    this._host.removeEventListener("mouseup", this._mouseUp);
  }

  private __mouseDown(e: MouseEvent): void {
    this._origin = this._extract(e);

    this._host.addEventListener("mousemove", this._mouseMove);
    this._host.addEventListener("mouseup", this._mouseUp);
  }

  private _prepare(pan: Coords): Coords {
    const { x: panX, y: panY } = pan;
    const { x: prevX, y: prevY } = this._previous;

    return {
      x: prevX + panX,
      y: prevY + panY,
    };
  }

  private _emit({ x, y }: Coords): void {
    this._changeFn!(`translate(${x}px, ${y}px)`);
  }

  private _extract(event: React.MouseEvent | MouseEvent): Coords {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }

  private _persist(e: MouseEvent): void {
    const pan = this.calculateRelPos(this._origin, this.extract(e));
    this._previous.x += pan.x;
    this._previous.y += pan.y;
  }

  listen(): void {
    this._host!.addEventListener("mousedown", this._mouseDown);
  }

  onValueChange(handler: (v: string) => void): void {
    this._changeFn = handler;
  }

  onDone(handler: (p: Coords) => void): void {
    this._doneFn = handler;
  }

  setHost(host: HTMLElement) {
    this._host = host;
  }

  destroy() {
    this._mouseUp!();
    this._host.removeEventListener("mousedown", this._mouseDown);

    this._changeFn = undefined;
  }

  forceChange(): void {
    this._emit(new Coords());
  }
}
