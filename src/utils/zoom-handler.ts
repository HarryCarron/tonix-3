import { BaseHandler } from "./base-handler";

export class ZoomHandler extends BaseHandler {
  constructor() {
    super();

    this._onWheel = this.__onWheel.bind(this);
  }

  private _zoom = 1;

  private _zoomChange!: (z: number) => void;

  private _onWheel: (e: WheelEvent) => void;

  private __onWheel(e: WheelEvent) {
    const { deltaY } = e;
    const factor = deltaY < 0 ? 0.005 : -0.005;

    this._zoom += factor;

    this._zoomChange(this._zoom);
  }

  onValueChange(changeHandler: (v: number) => void): void {
    this._zoomChange = changeHandler;
  }

  bootstrap(): void {
    this._zoomChange(1);
  }

  destroy(): void {
    this.host.removeEventListener("wheel", this._onWheel);
  }

  onDone(): void {}

  listen(): void {
    this.host.addEventListener("wheel", this._onWheel);
  }
}
