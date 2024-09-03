import stringify from 'fast-json-stable-stringify';
import { BehaviorSubject, concat, Observable, of, Subject } from 'rxjs';
import { buffer, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import { rootFieldKey } from './const';
import { denormalize } from './denormalize';
import { normalize } from './normalize';
import { isObject } from './utils';
import type { $StoreSchema, StoreSchema } from '../types';
import type { Data, Storage, Variables } from './types';

export class Cache {
  private storage: Storage = { [rootFieldKey]: {} };
  private pathSubject = new Subject<string[]>();
  private bufferSubject = new BehaviorSubject(null);

  read<T extends $StoreSchema>(storeSchema: StoreSchema<T>, variables: T['$input']): T['$output'] | null {
    const denormalized = denormalize(storeSchema, (variables ?? {}) as Variables, this.storage);
    return denormalized.partial ? null : (denormalized.data as T['$output']);
  }

  write<T extends $StoreSchema>(storeSchema: StoreSchema<T>, variables: T['$input'], data: T['$output']) {
    const normalized = normalize(storeSchema, (variables ?? {}) as Variables, data as Data);
    this.writeInternal(this.storage, normalized);
    this.bufferSubject.next(null);
  }

  observe<T extends $StoreSchema>(
    storeSchema: StoreSchema<T>,
    variables: T['$input'],
  ): Observable<{
    data: T['$output'];
    partial: boolean;
  }> {
    const denormalized = denormalize(storeSchema, (variables ?? {}) as Variables, this.storage);
    const pathsSubject = new BehaviorSubject<string[][]>(denormalized.paths);

    const source$ = concat(of(denormalized.paths), this.pathSubject.pipe(buffer(this.bufferSubject)));

    return source$.pipe(
      switchMap((paths) =>
        pathsSubject.pipe(filter((paths2) => paths2.some((a) => paths.some((b) => b.every((c, i) => c === a[i]))))),
      ),
      map(() => denormalize(storeSchema, (variables ?? {}) as Variables, this.storage)),
      tap((denormalized) => {
        if (stringify(denormalized.paths) !== stringify(pathsSubject.getValue())) {
          pathsSubject.next(denormalized.paths);
        }
      }),
      distinctUntilChanged((a, b) => stringify(a) === stringify(b)),
    );
  }

  private writeInternal(source: Storage, data: Storage, path: string[] = []) {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const sourceValue = source[key];
        const dataValue = data[key];

        if (isObject(sourceValue) && isObject(dataValue)) {
          this.writeInternal(sourceValue, dataValue, [...path, key]);
        } else {
          source[key] = dataValue;
          this.pathSubject.next([...path, key]);
        }
      }
    }
  }
}
