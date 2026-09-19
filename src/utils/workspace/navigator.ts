import { ENV } from "@/env";

export class NavigatorController {
  private _world?: HTMLDivElement;
  private _host?: HTMLDivElement;
  private _scaleVal?: number;

  setScaleVal(scale: number): this {
    this._scaleVal = scale;
    return this;
  }

  setWorldElement(elem: HTMLDivElement): this {
    this._world = elem;
    return this;
  }

  setHostElement(elem: HTMLDivElement): this {
    this._host = elem;
    return this;
  }

  init(): void {
    this._initResizeObserver();
    this._setWorldDims();
  }

  private _setWorldDims(): void {
    this._world!.style.height = `${ENV.worldDims * this._scaleVal!}px`;
    this._world!.style.width = `${ENV.worldDims * this._scaleVal!}px`;
  }

  // Re-derives the minimap's own fixed size (off ENV.worldDims, not off
  // `_host`) whenever `_host` resizes. Must observe `_host` and only ever
  // write to `_world` - `_host` is the real workspace canvas container, and
  // writing a computed inline size onto it (as this previously did, with
  // the observe/mutate targets swapped) crushes the actual pannable
  // viewport down to a few pixels.
  private _initResizeObserver(): void {
    new ResizeObserver(() => {
      this._setWorldDims();
    }).observe(this._host!);
  }
}
