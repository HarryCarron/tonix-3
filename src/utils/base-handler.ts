import { Coords } from "@/types/global/Coords";

export abstract class BaseHandler {
  host!: HTMLElement;

  public extract(event: React.MouseEvent | MouseEvent): Coords {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }

  public calculateRelPos(posA: Coords, posB: Coords): Coords {
    return new Coords(posB.x - posA.x, posB.y - posA.y);
  }

  abstract onValueChange(c: (v: unknown) => void): void;

  abstract onDone(c: (v: unknown) => void): void;

  abstract destroy(): void;

  abstract listen(): void;

  abstract bootstrap(): void;

  setHost(host: HTMLElement): this {
    this.host = host;

    return this;
  }
}
