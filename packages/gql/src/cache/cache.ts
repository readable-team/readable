import stringify from 'fast-json-stable-stringify';
import { concat, Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, tap } from 'rxjs/operators';
import { rootFieldKey } from './const';
import { denormalize } from './denormalize';
import { normalize } from './normalize';
import { isObject } from './utils';
import type { $StoreSchema, StoreSchema } from '../types';
import type { Data, EntityKey, Field, Storage, Variables } from './types';

export class Cache {
  private storage: Storage = { [rootFieldKey]: {} };
  private dependencies$ = new Subject<Set<string>>();

  read<T extends $StoreSchema>(storeSchema: StoreSchema<T>, variables: T['$input']): T['$output'] | null {
    const denormalized = denormalize(storeSchema, (variables ?? {}) as Variables, this.storage);
    return denormalized.partial ? null : (denormalized.data as T['$output']);
  }

  write<T extends $StoreSchema>(storeSchema: StoreSchema<T>, variables: T['$input'], data: T['$output']) {
    const normalized = normalize(storeSchema, (variables ?? {}) as Variables, data as Data);
    this.writeInternal(this.storage, normalized.data);
    this.dependencies$.next(normalized.dependencies);
  }

  delete(key: EntityKey) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.storage[key];
    this.dependencies$.next(new Set([key]));
  }

  observe<T extends $StoreSchema>(
    storeSchema: StoreSchema<T>,
    variables: T['$input'],
  ): Observable<{
    data: T['$output'];
    partial: boolean;
  }> {
    const denormalized = denormalize(storeSchema, (variables ?? {}) as Variables, this.storage);
    let dependencies = denormalized.dependencies;

    const source$ = concat(of(dependencies), this.dependencies$);

    return source$.pipe(
      filter((deps) => !deps.isDisjointFrom(dependencies)),
      map(() => denormalize(storeSchema, (variables ?? {}) as Variables, this.storage)),
      tap((denormalized) => (dependencies = denormalized.dependencies)),
      map((denormalized) => ({ data: denormalized.data, partial: denormalized.partial })),
      distinctUntilChanged((a, b) => stringify(a) === stringify(b)),
    );
  }

  private writeInternal(source: Field, data: Field) {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const sourceValue = source[key];
        const dataValue = data[key];

        if (isObject(sourceValue) && isObject(dataValue)) {
          this.writeInternal(sourceValue, dataValue);
        } else {
          source[key] = dataValue;
        }
      }
    }
  }
}
