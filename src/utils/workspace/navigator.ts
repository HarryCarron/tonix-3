import { ENV } from "@/env";

export class NavigatorController {
  private _world?: HTMLDivElement;
  private _camera?: HTMLDivElement;
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

  setCameraElement(elem: HTMLDivElement): this {
    this._camera = elem;
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

  private _initResizeObserver(): void {
    new ResizeObserver((entry: ResizeObserverEntry[]) => {
      const { width, height } = entry[0].contentRect;

      this._host!.style.width = `${width * this._scaleVal!}px`;
      this._host!.style.height = `${height * this._scaleVal!}px`;
    }).observe(this._world!);
  }
}
