import stringify from 'fast-json-stable-stringify';
import { match } from 'ts-pattern';
import { entityLinkKey, rootFieldKey } from './const';
import {
  deepMerge,
  isArray,
  isEntityLink,
  isObject,
  makeFieldKey,
  resolveEntityLink,
  transformArguments,
} from './utils';
import type { Selection, StoreSchema } from '../types';
import type { Storage, Variables } from './types';

export const denormalize = (storeSchema: Pick<StoreSchema, 'selections'>, variables: Variables, storage: Storage) => {
  const {
    selections: { operation, fragments },
  } = storeSchema;

  const paths: string[][] = [];
  let partial = false;

  const denormalizeObject = (value: Storage, selections: Selection[], path: string[]) => {
    const current: Record<string, unknown> = {};

    if (isEntityLink(value)) {
      const entityKey = resolveEntityLink(value);
      value = storage[entityKey] as Storage;
      paths.push([...path, entityLinkKey]);
      path = [entityKey];
    }

    for (const selection of selections) {
      // eslint-disable-next-line unicorn/prefer-switch
      if (selection.kind === 'TypenameField') {
        const key = makeFieldKey(selection.name, {});
        current[selection.alias ?? selection.name] = value[key];
        paths.push([...path, key]);
        if (value[key] === undefined) {
          partial = true;
        }
      } else if (selection.kind === 'ScalarField' || selection.kind === 'EnumField') {
        const key = makeFieldKey(selection.name, transformArguments(selection.arguments, variables));
        current[selection.alias ?? selection.name] = value[key];
        paths.push([...path, key]);
        if (value[key] === undefined) {
          partial = true;
        }
      } else if (selection.kind === 'ObjectField') {
        const key = makeFieldKey(selection.name, transformArguments(selection.arguments, variables));
        const v = value[key];

        if (v === null || v === undefined) {
          current[selection.alias ?? selection.name] = v;
          paths.push([...path, key]);
          if (v === undefined) {
            partial = true;
          }
        } else if (isObject(v)) {
          current[selection.alias ?? selection.name] ??= {};
          deepMerge(
            current[selection.alias ?? selection.name] as Record<string, unknown>,
            denormalizeObject(v, selection.children, [...path, key]),
          );
        } else if (isArray(v)) {
          current[selection.alias ?? selection.name] ??= [];
          for (const [i, element] of v.entries()) {
            if (element === null) {
              (current[selection.alias ?? selection.name] as unknown[])[i] = element;
            } else if (isObject((current[selection.alias ?? selection.name] as unknown[])[i])) {
              deepMerge(
                (current[selection.alias ?? selection.name] as unknown[])[i] as Record<string, unknown>,
                denormalizeObject(element as Storage, selection.children, [...path, key]),
              );
            } else {
              (current[selection.alias ?? selection.name] as unknown[])[i] = denormalizeObject(
                element as Storage,
                selection.children,
                [...path, key],
              );
            }
          }
        }
      } else if (selection.kind === 'FragmentSpread') {
        deepMerge(current, denormalizeObject(value, fragments[selection.name], [...path]));
      } else if (selection.kind === 'InlineFragment') {
        const types = match(selection.type)
          .with({ kind: 'Object' }, (t) => [t.name])
          .with({ kind: 'Interface' }, (t) => [t.name, ...t.implementations])
          .with({ kind: 'Union' }, (t) => [t.name, ...t.members])
          .exhaustive();

        if (types.includes(value.__typename as string)) {
          deepMerge(current, denormalizeObject(value, selection.children, [...path]));
        }
      }
    }

    return current;
  };

  const data = denormalizeObject(storage[rootFieldKey] as Storage, operation, [rootFieldKey]);
  const uniquePaths: string[][] = [...new Set(paths.map((v) => stringify(v)))].map((v) => JSON.parse(v));

  return { data, partial, paths: uniquePaths };
};
