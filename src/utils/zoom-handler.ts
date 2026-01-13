import { Coords } from "@/types/global/Coords";
import { BaseHandler } from "./base-handler";

export type ZoomChange = [Coords, number];

export class ZoomHandler extends BaseHandler<ZoomChange> {
  constructor() {
    super();

    this._onWheel = this.__onWheel.bind(this);
  }

  private _committed: ZoomChange = [new Coords(), 1];

  private _zoomChange!: (zoomChange: ZoomChange) => void;

  private _onWheel: (e: WheelEvent) => void;

  private __onWheel(e: WheelEvent) {
    const { deltaY } = e;
    const point = this.extract(e);
    // const factor: number = deltaY < 0 ? 0.005 : -0.005;

    this._committed[0] = point;
    const factor = deltaY < 0 ? 1.05 : 0.95;
    this._committed[1] *= factor;

    this._zoomChange(this._committed);
  }

  onChange(changeHandler: (v: ZoomChange) => void): void {
    this._zoomChange = changeHandler;
  }

  bootstrap(): void {
    this._zoomChange(this._committed);
  }

  destroy(): void {
    this.host.removeEventListener("wheel", this._onWheel);
  }

  onCommit(): void {}

  setDerived(): void {}

  init(): this {
    this.host.addEventListener("wheel", this._onWheel);
    return this;
  }
}
