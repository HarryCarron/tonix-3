import type { Coords } from "@/types/global/Coords";
import type { BaseHandler } from "./base-handler";
import { PanHandler } from "./pan-handler";
import { ZoomHandler, type ZoomChange } from "./zoom-handler";

type Interactions = "pan" | "zoom";

export interface InteractionPayload {
  key: Interactions;
  value: unknown;
}

interface HandlerDef {
  handler: BaseHandler<unknown>;
  value: unknown | undefined;
}

export type DerivedStateUpdate = Record<Interactions, unknown>;

/**
 * Used to update state of given handler without triggering an onChange event
 */
export type StateChangeHandler<T = unknown> = (v: T) => DerivedStateUpdate;

type AllStates = [Coords?, ZoomChange?];

interface ListenerDef<T = unknown> {
  onChange: (v: T) => StateChangeHandler<T> | void;
  onCommit?: (v: T) => StateChangeHandler<T> | void;
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

  private _getHandlerDef(interaction: Interactions): HandlerDef {
    return Object.entries(this._handlerMap).find(
      ([key]) => key === interaction
    )![1];
  }

  init(): this {
    Object.entries(this._handlerMap).forEach(([, def]) => {
      def.handler.setHost(this._host);
    });

    return this;
  }

  setHost(host: HTMLElement): this {
    this._host = host;

    return this;
  }

  listen(interaction: Interactions, listener: ListenerDef): this {
    const { onChange, onCommit } = listener;

    const def = this._getHandlerDef(interaction);
    def.handler.setHost(this._host);

    if (onCommit) {
      def.handler.onCommit(onCommit);
    }

    if (onChange) {
      def.handler.onChange(onChange);
    }

    // def.handler.listen();

    def.handler.bootstrap();

    return this;
  }

  setDerived<D>(interaction: Interactions, derived: D) {
    this._getHandlerDef(interaction).handler.setDerived(derived);
  }

  destroy(): void {
    Object.entries(this._handlerMap).forEach(([, def]) => {
      def.handler.destroy();
    });
  }
}
