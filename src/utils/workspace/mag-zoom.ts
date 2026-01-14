import { Coords } from "@/types/global/Coords";
import { DragAndDrop, type DragAndDropPayload } from "../drag-and-drop";
import { MagBoundingBox } from "./mag-bound-box";

type MagZoomListener = (v: [Coords, Coords]) => void;

export class MagZoom {
  private _host?: HTMLElement;

  private _magBoundingBox?: MagBoundingBox;

  private _bbCoords: [Coords?, Coords?] = [undefined, undefined];
  private _listener?: MagZoomListener;

  private _mouseMove({ type, e }: DragAndDropPayload): void {
    const currentCoords = Coords.eventToCoord(e);

    if (type === "start") {
      this._bbCoords[0] = currentCoords;
    }

    this._bbCoords[1] = currentCoords;

    if (type === "done") {
      this._listener!([this._bbCoords[0]!, this._bbCoords[1]!]);
      return this._magBoundingBox!.hide();
    }

    this._magBoundingBox!.update(this._bbCoords[0]!, this._bbCoords[1]!);
  }

  private _tranformPosition(coords: Coords): Coords {
    const rect = this._host!.getBoundingClientRect();
    return new Coords(coords.x - rect.left, coords.y - rect.top);
  }

  done?: () => void;

  setHost(host: HTMLDivElement): this {
    this._host = host;

    this._magBoundingBox = new MagBoundingBox(host).init();

    return this;
  }

  listen(l: MagZoomListener): void {
    this._listener = l;
    const dd = new DragAndDrop(this._host!, (e) => {
      this._mouseMove(e);
    });

    dd.listen();

    this.done = dd.done;
  }
}
