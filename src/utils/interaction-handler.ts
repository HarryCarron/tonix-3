import type { BaseHandler } from "./base-handler";
import { PanHandler } from "./pan-handler";

type Interactions = "pan" | "zoom";

type TransformChangeHandler = (t: string) => void;

interface HandlerDef {
  handler: BaseHandler;
  value: string | undefined;
}

interface ListenerDef<T = unknown> {
  key: Interactions;
  selectDone: (v: T) => void;
}

export class InteractionHandler {
  private _host!: HTMLElement;

  private readonly _handlerMap: Record<string, HandlerDef> = {
    pan: {
      handler: new PanHandler(),
      value: undefined,
    },
  };
  private _transformChangeHandler!: TransformChangeHandler;

  private _getHandlerDef(interaction: Interactions): HandlerDef {
    return Object.entries(this._handlerMap).find(([key]) => {
      return key === interaction;
    })![1];
  }

  private _emit(): void {
    const transform = Object.entries(this._handlerMap)
      .map(([, def]) => def.value)
      .join(" ");

    this._transformChangeHandler(transform);
  }

  private _initListener(ListenerDef: ListenerDef): void {
    const { key, selectDone } = ListenerDef;

    const def = this._getHandlerDef(key);
    def.handler.setHost(this._host);

    if (selectDone) {
      def.handler.onDone((v) => {
        selectDone(v);
      });
    }

    def.handler.onValueChange((value: string) => {
      def.value = value;
      this._emit();
    });

    def.handler.listen();
  }

  init(): this {
    Object.entries(this._handlerMap).forEach(([, def]) => {
      def.handler.setHost(this._host);
      def.handler.onValueChange((value: string) => (def.value = value));
      def.handler.forceChange();
      def.handler.destroy();
    });

    this._emit();

    return this;
  }

  setHost(host: HTMLElement): this {
    this._host = host;

    return this;
  }

  transformChange(handler: TransformChangeHandler): this {
    this._transformChangeHandler = handler;

    return this;
  }

  listen(...listeners: ListenerDef[]): void {
    listeners.forEach((listener) => {
      this._initListener(listener);
    });
  }

  done(): void {
    Object.entries(this._handlerMap).forEach(([, def]) => {
      def.handler.destroy();
    });
  }

  select(key: Interactions, onChange: (v: unknown) => void): this {
    this._getHandlerDef(key).handler.onDone(onChange);

    return this;
  }
}
