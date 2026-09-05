import { Coords } from "@/types/global/Coords";
import { DragAndDrop, type DragAndDropPayload } from "../drag-and-drop";
import { BoundingBox } from "./bounding-box";

type MagZoomListener = (rect: Rect) => void;

export type Rect = { x: number; y: number; w: number; h: number };

/**
 * Drag-to-select-a-region tool, used by the "mag" (zoom-to-region) editor
 * tool. Wraps a `DragAndDrop` (for the mouse gesture) and a `BoundingBox`
 * (the visible selection overlay) to turn a click-drag into a `Rect`
 * spanning the drag's start and current points.
 *
 * Usage: `new BoundingBoxTool().setHost(el).listen(rect => ...)`, then
 * `done()` to stop listening (e.g. when the editor tool changes).
 */
export class BoundingBoxTool {
  private _host?: HTMLElement;

  private _boundingBox?: BoundingBox;

  private _bbCoords: [Coords?, Coords?] = [undefined, undefined];

  private _listener?: MagZoomListener;

  private _rectFromPoints(a: Coords, b: Coords): Rect {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    return {
      x,
      y,
      w: Math.abs(b.x - a.x),
      h: Math.abs(b.y - a.y),
    };
  }

  private _mouseMove({ type, e }: DragAndDropPayload): void {
    const currentCoords = Coords.eventToCoord(e);

    if (type === "start") {
      this._bbCoords[0] = currentCoords;
    }

    this._bbCoords[1] = currentCoords;

    const rect = this._rectFromPoints(this._bbCoords[0]!, this._bbCoords[1]!);

    if (type === "done") {
      this._listener!(rect);
      return this._boundingBox!.hide();
    }

    this._boundingBox!.update(rect);
  }

  /** Stops listening for drags. Assigned once `listen` is called. */
  done?: () => void;

  /** Sets the element the selection drag happens over, and mounts the overlay. */
  setHost(host: HTMLDivElement): this {
    this._host = host;

    this._boundingBox = new BoundingBox(host).init();

    return this;
  }

  /** Starts listening for a selection drag, calling `l` with the resulting rect once the drag ends. */
  listen(l: MagZoomListener): void {
    this._listener = l;
    const dd = new DragAndDrop().setHost(this._host!);

    dd.listen((e) => {
      this._mouseMove(e);
    });

    this.done = () => dd.done();
  }
}
