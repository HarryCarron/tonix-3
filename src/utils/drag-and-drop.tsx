export interface Position {
  x: number;
  y: number;
}

/**
 * Reported to a `DragAndDrop` handler at each stage of a drag: `"start"` on
 * mousedown, `"dragging"` on every subsequent mousemove, `"done"` on
 * mouseup. `e` is the raw DOM mouse event for that stage; consumers convert
 * it into whatever coordinate space or delta they actually need.
 */
export interface DragAndDropPayload {
  type: "start" | "dragging" | "done";
  e: Event;
}

type DragAndDropHandler = (v: DragAndDropPayload) => void;

/**
 * Generic mouse-drag primitive. Attaches `mousedown` to a host element to
 * detect the start of a drag, then tracks `mousemove`/`mouseup` on
 * `document` (not the host) for the rest of the gesture, since the pointer
 * can move outside the host's bounds mid-drag and mouse events only bubble
 * through the actual ancestor chain of whatever element they're currently
 * over.
 *
 * Usage: `new DragAndDrop().setHost(el).listen(handler)`, then `done()` to
 * stop listening (e.g. on unmount).
 */
export class DragAndDrop {
  private _host?: HTMLElement | SVGSVGElement;

  private _handler?: DragAndDropHandler;

  private _mouseDown = this.__mouseDown.bind(this);

  private _mouseMove = this.__mouseMove.bind(this);

  private _mouseUp = this.__mouseUp.bind(this);

  /** Sets the element that starts a drag on mousedown. Call before `listen`. */
  setHost(host: HTMLElement | SVGSVGElement): this {
    this._host = host;

    return this;
  }

  private __mouseDown(e: Event): void {
    this._handler!({
      type: "start",
      e,
    });
    // bound to document, not _host: once a drag starts, the pointer can
    // move outside the host's bounds, and mouse events only bubble through
    // the actual ancestor chain of whatever element they're currently over
    document.addEventListener("mousemove", this._mouseMove);
    document.addEventListener("mouseup", this._mouseUp);
  }

  private __mouseMove(e: Event): void {
    this._handler!({
      type: "dragging",
      e,
    });
  }

  private __mouseUp(e?: Event): void {
    if (e) {
      this._handler!({
        type: "done",
        e,
      });
    } else {
      this._host!.removeEventListener("mousedown", this._mouseDown);
    }

    document.removeEventListener("mousemove", this._mouseMove);
    document.removeEventListener("mouseup", this._mouseUp);
  }

  /** Stops listening entirely, including removing the host's mousedown listener. */
  done(): void {
    this.__mouseUp();
  }

  /** Starts listening for drags on the host, invoking `handler` at each stage. */
  listen(handler: DragAndDropHandler): void {
    this._handler = handler;
    this._host!.addEventListener("mousedown", this._mouseDown);
  }
}
