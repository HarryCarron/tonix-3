export class Coords {
  constructor(public x: number = 0, public y: number = 0) {}

  get xPx(): string {
    return this.x + "px";
  }

  get yPx(): string {
    return this.y + "px";
  }

  static eventToCoord(event: MouseEvent) {
    return new Coords(event.clientX, event.clientY);
  }
}
