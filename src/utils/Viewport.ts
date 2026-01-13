import { Coords } from "@/types/global/Coords";
import { PanHandler } from "./pan-handler";
import { ZoomHandler, type ZoomChange } from "./zoom-handler";
import type { BaseHandler } from "./base-handler";

export interface ViewPortValues {
  zoom: ZoomChange;
  pan: Coords;
}

export interface ViewPortValuesReturn {
  zoom?: ZoomChange;
  pan?: Coords;
}

type Pipe = (v: ViewPortValues) => ViewPortValuesReturn | undefined;

type Pipes = {
  onChange: Pipe;
  onCommit?: Pipe;
};

export class Viewport {
  private _host: HTMLElement | undefined;

  private _boundyDims: number | undefined;

  private _listeners: Record<string, BaseHandler> = {
    zoom: new ZoomHandler(),
    pan: new PanHandler(),
  };

  private _state: ViewPortValues = {
    zoom: [new Coords(), 1],
    pan: new Coords(),
  };

  private _pipes: Pipes | undefined;

  private _emitChange(): void {
    const derived = this._pipes?.onChange!(this._state);

    if (derived?.pan) {
      this._listeners["pan"].setDerived(derived.pan);
    }
  }

  pipe(pipes: Pipes): this {
    this._pipes = pipes;

    return this;
  }

  listen(key: string): this {
    if (key === "pan") {
      this._listeners.pan
        .setHost(this._host!)
        .init()
        .onChange((v: Coords) => {
          this._state["pan"] = v;

          this._emitChange();
        });
    }
    if (key === "zoom") {
      this._listeners.zoom
        .setHost(this._host!)
        .init()
        .onChange((v: ZoomChange) => {
          this._state["zoom"] = v;

          this._emitChange();
        });
    }

    return this;
  }

  setHost(host: HTMLElement): this {
    this._host = host;

    return this;
  }

  setBoundaryDims(boundaryDims: number): this {
    this._boundyDims = boundaryDims;

    return this;
  }

  destroy() {}
}

// ZOOM
//         const [zoomPoint, newZoom] = zoomChange;
//         console.log("zp", zoomPoint);
//         console.log("zp", newZoom);
//         const oldZoom = localZoom.current[1];
//         const _pan = localPan.current;

//         // world coordinates of mouse before zoom
//         const worldX = zoomPoint.x / oldZoom - _pan.x;
//         const worldY = zoomPoint.y / oldZoom - _pan.y;

//         // compute new pan to anchor mouse
//         const anchoredPan = {
//           x: zoomPoint.x / newZoom - worldX,
//           y: zoomPoint.y / newZoom - worldY,
//         };

//         // silent pan update
//         pan.setDerived(anchoredPan);

//         // update local refs
//         localPan.current = anchoredPan;
//         localZoom.current = [zoomPoint, newZoom];
