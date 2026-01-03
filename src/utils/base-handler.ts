import { Coords } from "@/types/global/Coords";

export abstract class BaseHandler<T = unknown> {
  public extract(event: React.MouseEvent | MouseEvent): Coords {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }

  public calculateRelPos(posA: Coords, posB: Coords): Coords {
    return new Coords(posB.x - posA.x, posB.y - posA.y);
  }

  abstract onValueChange(c: (v: string) => void): void;

  abstract onDone(c: (v: T) => void): void;

  abstract destroy(): void;

  abstract listen(): void;

  abstract setHost(h: HTMLElement): void;

  abstract forceChange(): void;
}
