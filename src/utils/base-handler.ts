import { Coords } from "@/types/global/Coords";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class BaseHandler<T = any> {
  host!: HTMLElement;

  extract(event: MouseEvent): Coords {
    const rect = this.host.getBoundingClientRect();

    return new Coords(event.clientX - rect.left, event.clientY - rect.top);
  }

  setHost(host: HTMLElement): this {
    this.host = host;

    return this;
  }

  abstract onChange(c: (v: T) => void): void;

  abstract onCommit(c: (v: T) => void): void;

  abstract destroy(): void;

  abstract init(): this;

  abstract bootstrap(): void;

  abstract setDerived(d: T): void;
}
