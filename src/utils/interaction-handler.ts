import type { BaseHandler } from "./base-handler";
import { PanHandler } from "./pan-handler";
import { ZoomHandler } from "./zoom-handler";

type Interactions = "pan" | "zoom";

type TransformChangeHandler = (handlerMap: HandlerMap) => void;

export interface InteractionPayload {
  key: Interactions;
  value: unknown;
}

interface HandlerDef {
  handler: BaseHandler;
  value: unknown | undefined;
}

interface ListenerDef<T = unknown> {
  key: Interactions;
  selectDone: (v: T) => void;
}

export type HandlerMap = Record<string, HandlerDef>;

export class InteractionHandler {
  private _host!: HTMLElement;

  private readonly _handlerMap: HandlerMap = {
    pan: {
      handler: new PanHandler(),
      value: undefined,
    },
    zoom: {
      handler: new ZoomHandler(),
      value: undefined,
    },
  };
  private _changeHandler!: TransformChangeHandler;

  private _getHandlerDef(interaction: Interactions): HandlerDef {
    return Object.entries(this._handlerMap).find(
      ([key]) => key === interaction
    )![1];
  }

  private _emit(): void {
    this._changeHandler(this._handlerMap);
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

    def.handler.onValueChange((value: unknown) => {
      def.value = value;
      this._emit();
    });

    def.handler.listen();
  }

  init(): this {
    Object.entries(this._handlerMap).forEach(([, def]) => {
      def.handler.setHost(this._host);
      def.handler.onValueChange((value: unknown) => (def.value = value));
      def.handler.bootstrap();
      def.handler.destroy();
    });

    this._emit();

    return this;
  }

  setHost(host: HTMLElement): this {
    this._host = host;

    return this;
  }

  onChange(handler: TransformChangeHandler): this {
    this._changeHandler = handler;

    return this;
  }

  listen(...listeners: ListenerDef[]): void {
    listeners.forEach((listener) => {
      this._initListener(listener);
    });
  }

  destroy(): void {
    Object.entries(this._handlerMap).forEach(([, def]) => {
      def.handler.destroy();
    });
  }

  select(key: Interactions, onChange: (v: unknown) => void): this {
    this._getHandlerDef(key).handler.onDone(onChange);

    return this;
  }
}
