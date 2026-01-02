import { Coords } from "@/types/global/Coords";
import type React from "react";

export class PanHandler {
  private _origin = new Coords();
  private _current = new Coords();

  setOrigin(event: React.MouseEvent) {
    this._origin.x = event.clientX;
    this._origin.y = event.clientY;
  }

  done(): Coords {
    return this._current;
  }

  update(event: React.MouseEvent): Coords {
    const { x, y } = this._extract(event);
    this._current.x = this._origin.x - x;
    this._current.y = this._origin.x - y;

    return this._current;
  }

  private _calculateRelPos(posA: Coords, posB: Coords): Coords {
    return new Coords(posB.x - posA.x, posB.y - posA.y);
  }

  private _extract(event: React.MouseEvent | MouseEvent): Coords {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }

  listen(
    onMove: (coord: Coords) => void,
    origin: React.MouseEvent,
    host: HTMLElement
  ) {
    const originP = this._extract(origin);

    const _move = (e: MouseEvent) => {
      const newP = this._extract(e);
      const outP = this._calculateRelPos(originP, newP);
      onMove(outP);
    };

    host.addEventListener("mousemove", _move);
    host.addEventListener("mouseup", () => {
      host.removeEventListener("mousemove", _move);
    });
  }
}
