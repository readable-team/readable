import { Repeater } from '@repeaterjs/repeater';

/*
 * Copied from https://github.com/dotansimha/graphql-yoga/blob/d3387b9f4546704a984b0d2444e903b7999304d6/packages/event-target/typed-event-target/src/index.ts
 */

export type TypedEventListener<TEvent extends CustomEvent> = (evt: TEvent) => void;

export type TypedEventListenerObject<TEvent extends CustomEvent> = {
  handleEvent(object: TEvent): void;
};

export type TypedEventListenerOrEventListenerObject<TEvent extends CustomEvent> =
  | TypedEventListener<TEvent>
  | TypedEventListenerObject<TEvent>;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface TypedEventTarget<TEvent extends CustomEvent> extends EventTarget {
  addEventListener(
    type: string,
    callback: TypedEventListenerOrEventListenerObject<TEvent> | null,
    options?: AddEventListenerOptions | boolean,
  ): void;
  dispatchEvent(event: TEvent): boolean;
  removeEventListener(
    type: string,
    callback: TypedEventListenerOrEventListenerObject<TEvent> | null,
    options?: EventListenerOptions | boolean,
  ): void;
}

/*
 * Copied from https://github.com/dotansimha/graphql-yoga/blob/d3387b9f4546704a984b0d2444e903b7999304d6/packages/subscription/src/create-pub-sub.ts
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PubSubPublishArgsByKey = Record<string, [] | [any] | [number | string, any]>;

type MapToNull<T> = T extends undefined ? null : T;

export type PubSubEvent<
  TPubSubPublishArgsByKey extends PubSubPublishArgsByKey,
  TKey extends Extract<keyof TPubSubPublishArgsByKey, string>,
> = CustomEvent<
  TPubSubPublishArgsByKey[TKey][1] extends undefined
    ? TPubSubPublishArgsByKey[TKey][0]
    : TPubSubPublishArgsByKey[TKey][1]
>;

export type PubSubEventTarget<TPubSubPublishArgsByKey extends PubSubPublishArgsByKey> = TypedEventTarget<
  PubSubEvent<TPubSubPublishArgsByKey, Extract<keyof TPubSubPublishArgsByKey, string>>
>;

export type ChannelPubSubConfig<TPubSubPublishArgsByKey extends PubSubPublishArgsByKey> = {
  /**
   * The event target. If not specified an (in-memory) EventTarget will be created.
   * For multiple server replica or serverless environments a distributed EventTarget is recommended.
   *
   * An event dispatched on the event target MUST have a `data` property.
   */
  eventTarget?: PubSubEventTarget<TPubSubPublishArgsByKey>;
};

export type PubSub<TPubSubPublishArgsByKey extends PubSubPublishArgsByKey> = {
  /**
   * Publish a value for a given topic.
   */
  publish<TKey extends Extract<keyof TPubSubPublishArgsByKey, string>>(
    routingKey: TKey,
    ...args: TPubSubPublishArgsByKey[TKey]
  ): void;
  /**
   * Subscribe to a topic.
   */
  subscribe<TKey extends Extract<keyof TPubSubPublishArgsByKey, string>>(
    ...[routingKey, id]: TPubSubPublishArgsByKey[TKey][1] extends undefined
      ? [TKey]
      : [TKey, TPubSubPublishArgsByKey[TKey][0]]
  ): Repeater<
    TPubSubPublishArgsByKey[TKey][1] extends undefined
      ? MapToNull<TPubSubPublishArgsByKey[TKey][0]>
      : MapToNull<TPubSubPublishArgsByKey[TKey][1]>
  >;
};

/**
 * Utility for publishing and subscribing to events.
 */
export const createPubSub = <TPubSubPublishArgsByKey extends PubSubPublishArgsByKey>(
  config?: ChannelPubSubConfig<TPubSubPublishArgsByKey>,
): PubSub<TPubSubPublishArgsByKey> => {
  const target = config?.eventTarget ?? (new EventTarget() as PubSubEventTarget<TPubSubPublishArgsByKey>);

  return {
    publish<TKey extends Extract<keyof TPubSubPublishArgsByKey, string>>(
      routingKey: TKey,
      ...args: TPubSubPublishArgsByKey[TKey]
    ) {
      const payload = args[1] ?? args[0] ?? null;
      const topic = args[1] === undefined ? routingKey : `${routingKey}:${args[0] as number}`;

      const event: PubSubEvent<TPubSubPublishArgsByKey, TKey> = new CustomEvent(topic, {
        detail: payload,
      });
      target.dispatchEvent(event);
    },
    subscribe<TKey extends Extract<keyof TPubSubPublishArgsByKey, string>>(
      ...[routingKey, id]: TPubSubPublishArgsByKey[TKey][1] extends undefined
        ? [TKey]
        : [TKey, TPubSubPublishArgsByKey[TKey][0]]
    ): Repeater<
      TPubSubPublishArgsByKey[TKey][1] extends undefined
        ? TPubSubPublishArgsByKey[TKey][0]
        : TPubSubPublishArgsByKey[TKey][1]
    > {
      const topic = id === undefined ? routingKey : `${routingKey}:${id as number}`;

      return new Repeater(function subscriptionRepeater(next, stop) {
        stop.then(function subscriptionRepeaterStopHandler() {
          target.removeEventListener(topic, pubsubEventListener);
        });

        target.addEventListener(topic, pubsubEventListener);

        function pubsubEventListener(event: PubSubEvent<TPubSubPublishArgsByKey, TKey>) {
          next(event.detail);
        }
      });
    },
  };
};
