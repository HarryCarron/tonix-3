import { Coords } from "@/types/global/Coords";
import { BaseHandler } from "./base-handler";

export type PanPayload = [Coords, Coords];

type PanChangeHandler = (t: Coords) => void;

export class PanHandler extends BaseHandler<Coords> {
  private _origin = new Coords();

  private _committed = new Coords();

  private _changeFn: PanChangeHandler | undefined;

  private _mouseMove!: (e: MouseEvent) => void;

  private _mouseUp!: (e?: MouseEvent) => void;

  private _mouseDown!: (e: MouseEvent) => void;

  private _onCommit?: (p: Coords) => void;

  constructor() {
    super();

    this._mouseMove = this.__mouseMove.bind(this);
    this._mouseUp = this.__mouseUp.bind(this);
    this._mouseDown = this.__mouseDown.bind(this);
  }

  private __mouseMove(e: MouseEvent): void {
    const delta = this._calculateRelPos(this._origin, this._extract(e));
    const pan = this._prepare(delta);

    this._emit(pan);
  }

  private __mouseUp(e?: MouseEvent): void {
    if (e) {
      this._commit(e);
      this._onCommit?.(this._committed);
    }
    this.host.removeEventListener("mousemove", this._mouseMove);
    this.host.removeEventListener("mouseup", this._mouseUp);
  }

  private __mouseDown(e: MouseEvent): void {
    this._origin = this._extract(e);

    this.host.addEventListener("mousemove", this._mouseMove);
    this.host.addEventListener("mouseup", this._mouseUp);
  }

  private _prepare(pan: Coords): Coords {
    const { x: panX, y: panY } = pan;
    const { x: committedX, y: committedY } = this._committed;

    return {
      x: committedX + panX,
      y: committedY + panY,
    };
  }

  private _calculateRelPos(posA: Coords, posB: Coords): Coords {
    return new Coords(posB.x - posA.x, posB.y - posA.y);
  }

  private _emit(coords: Coords): void {
    this._changeFn!(coords);
  }

  private _extract(event: React.MouseEvent | MouseEvent): Coords {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }

  private _commit(e: MouseEvent): void {
    const pan = this._calculateRelPos(this._origin, this.extract(e));
    this._committed.x += pan.x;
    this._committed.y += pan.y;
  }

  setDerived(derivedCoords: Coords): void {
    this._committed = derivedCoords;
  }

  init(): this {
    this.host!.addEventListener("mousedown", this._mouseDown);

    return this;
  }

  onChange(handler: (v: Coords) => void): void {
    this._changeFn = handler;
  }

  onCommit(handler: (p: Coords) => void): void {
    this._onCommit = handler;
  }

  destroy() {
    this._mouseUp!();
    this.host.removeEventListener("mousedown", this._mouseDown);

    this._changeFn = undefined;
  }

  bootstrap(): void {
    this._emit(new Coords());
  }
}
