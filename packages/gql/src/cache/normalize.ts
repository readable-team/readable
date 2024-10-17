import { match } from 'ts-pattern';
import { entityLinkKey, rootFieldKey } from './const';
import {
  deepMerge,
  isArray,
  isEntityKeyable,
  isEntityLink,
  isObject,
  makeEntityKey,
  makeEntityLink,
  makeFieldKey,
  resolveEntityLink,
  transformArguments,
} from './utils';
import type { Selection, StoreSchema } from '../types';
import type { Data, Field, Storage, Variables } from './types';

export const normalize = (storeSchema: StoreSchema, variables: Variables, data: Data) => {
  const {
    selections: { operation, fragments },
  } = storeSchema;

  const storage: Storage = { [rootFieldKey]: {} };

  const normalizeObject = (value: Data, selections: Selection[]) => {
    let current: Field = {};

    for (const selection of selections) {
      if (selection.kind === 'TypenameField') {
        const key = makeFieldKey(selection.name, {});
        current[key] = value[selection.alias ?? selection.name];
      } else if (selection.kind === 'ScalarField' || selection.kind === 'EnumField') {
        const key = makeFieldKey(selection.name, transformArguments(selection.arguments, variables));
        current[key] = value[selection.alias ?? selection.name];
      } else if (selection.kind === 'ObjectField') {
        const key = makeFieldKey(selection.name, transformArguments(selection.arguments, variables));
        const v = value[selection.alias ?? selection.name];

        if (v === null) {
          current[key] = null;
        } else if (isArray(v)) {
          current[key] = v.map((element) =>
            element === null ? null : normalizeObject(element as Data, selection.children),
          );
        } else if (isObject(v)) {
          current[key] = normalizeObject(v, selection.children);
        }
      } else if (selection.kind === 'FragmentSpread') {
        current = { ...current, ...normalizeObject(value, fragments[selection.name]) };
      } else if (selection.kind === 'InlineFragment') {
        const types = match(selection.type)
          .with({ kind: 'Object' }, (t) => [t.name])
          .with({ kind: 'Interface' }, (t) => [t.name, ...t.implementations])
          .with({ kind: 'Union' }, (t) => [t.name, ...t.members])
          .exhaustive();

        if (types.includes(value.__typename as string)) {
          current = { ...current, ...normalizeObject(value, selection.children) };
        }
      }
    }

    if (isEntityLink(current)) {
      const entityKey = resolveEntityLink(current);
      storage[entityKey] ??= {};
      deepMerge(
        storage[entityKey],
        Object.fromEntries(Object.entries(current).filter(([key]) => key !== entityLinkKey)),
      );
      current = makeEntityLink(entityKey);
    } else if (isEntityKeyable(current)) {
      const entityKey = makeEntityKey(current);
      storage[entityKey] ??= {};
      deepMerge(storage[entityKey], current);
      current = makeEntityLink(entityKey);
    }

    return current;
  };

  const root = normalizeObject(data, operation);
  const dependencies = new Set<string>(Object.keys(storage));

  if (storeSchema.kind === 'query') {
    storage[rootFieldKey] = root;
  }

  return { data: storage, dependencies };
};
