import type { Exchange } from './types';

export const composeExchanges = (exchanges: Exchange[]): Exchange => {
  return ({ forward }) => {
    // eslint-disable-next-line unicorn/no-array-reduce
    return exchanges.reduceRight((forward, exchange) => {
      return exchange({ forward });
    }, forward);
  };
};
