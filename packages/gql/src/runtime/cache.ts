import { makeEntityKey } from '../cache/utils';
import { getClient } from '../client/internal';
import type { Cache } from '../cache/cache';
import type { EntityKey } from '../cache/types';

type ResolveParams = { __typename: string; id: string };

class CacheFacade {
  private cache: Cache;

  constructor() {
    const { client } = getClient();
    this.cache = client.cache;
  }

  invalidate(key: EntityKey) {
    this.cache.delete(key);
  }

  resolve(params: ResolveParams) {
    return makeEntityKey(params);
  }
}

export type { CacheFacade };
export const cache = new CacheFacade();
