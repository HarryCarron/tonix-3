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

  abstract onChange(c: T): void;

  abstract done(): void;
}
