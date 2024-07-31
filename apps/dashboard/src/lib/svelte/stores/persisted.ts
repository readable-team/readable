import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Writable } from 'svelte/store';

export const persisted = <T>(key: string): Writable<T | null> => {
  if (!browser) {
    return writable<T | null>(null);
  }

  const value = localStorage.getItem(key);
  const store = writable<T | null>(value === null ? null : JSON.parse(value));

  return {
    subscribe: store.subscribe,
    set: (value) => {
      store.set(value);

      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    },
    update: (fn) => {
      store.update((prev) => {
        const value = fn(prev);

        if (value === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, JSON.stringify(value));
        }

        return value;
      });
    },
  };
};
