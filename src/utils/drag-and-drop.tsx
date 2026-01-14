export interface Position {
  x: number;
  y: number;
}

export interface DragAndDropPayload {
  type: "start" | "dragging" | "done";
  e: MouseEvent;
}

type DragAndDropHandler = (v: DragAndDropPayload) => void;

export class DragAndDrop {
  private readonly _host: HTMLElement;
  private readonly _handler: DragAndDropHandler;

  private _mouseDown: (e: MouseEvent) => void;

  private _mouseMove: (e: MouseEvent) => void;

  private _mouseUp: (e: MouseEvent) => void;

  constructor(host: HTMLElement, handler: DragAndDropHandler) {
    this._host = host;
    this._handler = handler;

    this._mouseDown = this.__mouseDown.bind(this);
    this._mouseMove = this.__mouseMove.bind(this);
    this._mouseUp = this.__mouseUp.bind(this);
  }

  private __mouseDown(e: MouseEvent): void {
    this._handler({
      type: "start",
      e,
    });
    this._host.addEventListener("mousemove", this._mouseMove);
    this._host.addEventListener("mouseup", this._mouseUp);
  }

  private __mouseMove(e: MouseEvent): void {
    this._handler({
      type: "dragging",
      e,
    });
  }

  private __mouseUp(e?: MouseEvent): void {
    if (e) {
      this._handler({
        type: "done",
        e,
      });
    } else {
      this._host.removeEventListener("mousedown", this._mouseDown);
    }

    this._host.removeEventListener("mousemove", this._mouseMove);
    this._host.removeEventListener("mouseup", this._mouseUp);
  }

  done(): void {
    this.__mouseUp();
  }

  listen(): void {
    this._host!.addEventListener("mousedown", this._mouseDown);
  }
}
