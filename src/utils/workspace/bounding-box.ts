import type { Rect } from "./bounding-box-tool";

export class BoundingBox {
  constructor(private readonly _host: HTMLDivElement) {}

  private _elem?: HTMLSpanElement;

  init(): this {
    const boundingBox = document.createElement("span");
    boundingBox.style.setProperty("position", "fixed");
    boundingBox.style.setProperty("display", "none");
    boundingBox.style.setProperty("border", "1px solid rgb(255, 64, 180)");
    boundingBox.style.setProperty(
      "background-color",
      "rgba(255, 64, 180, 0.2)"
    );

    this._elem = boundingBox;

    this._host.appendChild(this._elem);

    return this;
  }

  private _toggle(mode: boolean) {
    const value = mode ? "inline" : "none";
    this._elem!.style.setProperty("display", value);
  }

  hide() {
    this._toggle(false);
  }

  update(rect: Rect) {
    this._toggle(true);

    const elem = this._elem!;

    const { x, y, h, w } = rect;

    elem.style.left = x + "px";
    elem.style.top = y + "px";
    elem.style.width = w + "px";
    elem.style.height = h + "px";
  }
}
