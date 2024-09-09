import { match } from 'ts-pattern';
import { rootFieldKey } from './const';
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
import type { Field, Storage, Variables } from './types';

export const denormalize = (storeSchema: StoreSchema, variables: Variables, storage: Storage) => {
  const {
    selections: { operation, fragments },
  } = storeSchema;

  let partial = false;
  const dependencies = new Set<string>();

  const denormalizeObject = (value: Field, selections: Selection[]) => {
    const current: Record<string, unknown> = {};

    if (isEntityLink(value)) {
      const entityKey = resolveEntityLink(value);
      value = storage[entityKey] ?? {};
      dependencies.add(entityKey);
    }

    for (const selection of selections) {
      // eslint-disable-next-line unicorn/prefer-switch
      if (selection.kind === 'TypenameField') {
        const key = makeFieldKey(selection.name, {});
        current[selection.alias ?? selection.name] = value[key];
        if (value[key] === undefined) {
          partial = true;
        }
      } else if (selection.kind === 'ScalarField' || selection.kind === 'EnumField') {
        const key = makeFieldKey(selection.name, transformArguments(selection.arguments, variables));
        current[selection.alias ?? selection.name] = value[key];
        if (value[key] === undefined) {
          partial = true;
        }
      } else if (selection.kind === 'ObjectField') {
        const key = makeFieldKey(selection.name, transformArguments(selection.arguments, variables));
        const v = value[key];

        if (v === null || v === undefined) {
          current[selection.alias ?? selection.name] = v;
          if (v === undefined) {
            partial = true;
          }
        } else if (isObject(v)) {
          current[selection.alias ?? selection.name] ??= {};
          deepMerge(
            current[selection.alias ?? selection.name] as Record<string, unknown>,
            denormalizeObject(v, selection.children),
          );
        } else if (isArray(v)) {
          current[selection.alias ?? selection.name] ??= [];
          for (const [i, element] of v.entries()) {
            if (element === null) {
              (current[selection.alias ?? selection.name] as unknown[])[i] = element;
            } else if (isObject((current[selection.alias ?? selection.name] as unknown[])[i])) {
              deepMerge(
                (current[selection.alias ?? selection.name] as unknown[])[i] as Record<string, unknown>,
                denormalizeObject(element as Storage, selection.children),
              );
            } else {
              (current[selection.alias ?? selection.name] as unknown[])[i] = denormalizeObject(
                element as Storage,
                selection.children,
              );
            }
          }
        }
      } else if (selection.kind === 'FragmentSpread') {
        deepMerge(current, denormalizeObject(value, fragments[selection.name]));
      } else if (selection.kind === 'InlineFragment') {
        const types = match(selection.type)
          .with({ kind: 'Object' }, (t) => [t.name])
          .with({ kind: 'Interface' }, (t) => [t.name, ...t.implementations])
          .with({ kind: 'Union' }, (t) => [t.name, ...t.members])
          .exhaustive();

        if (types.includes(value.__typename as string)) {
          deepMerge(current, denormalizeObject(value, selection.children));
        }
      }
    }

    return current;
  };

  const data = denormalizeObject(storage[rootFieldKey], operation);

  return { data, partial, dependencies };
};
