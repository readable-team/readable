import stringify from 'fast-json-stable-stringify';
import { entityLinkKey } from './const';
import type { Argument, Value } from '../types';
import type { EntityKey, EntityLink, FieldKey, KeyableEntity, Variables } from './types';

export const makeFieldKey = (fieldName: string, args: Variables): FieldKey => {
  return Object.keys(args).length === 0 ? fieldName : `${fieldName}@${stringify(args)}`;
};

export const makeEntityKey = ({ __typename, id }: KeyableEntity): EntityKey => {
  return `${__typename}:${id}`;
};

export const isEntityKeyable = (data: unknown): data is KeyableEntity => {
  return isObject(data) && typeof data.__typename === 'string' && typeof data.id === 'string';
};

export const isEntityLink = (data: unknown): data is EntityLink => {
  return isObject(data) && entityLinkKey in data;
};

export const makeEntityLink = (key: EntityKey): EntityLink => {
  return { [entityLinkKey]: key };
};

export const resolveEntityLink = (link: EntityLink): EntityKey => {
  return link[entityLinkKey];
};

export const isObject = (data: unknown): data is Record<string | number | symbol, unknown> => {
  return typeof data === 'object' && data !== null && !Array.isArray(data);
};

export const isArray = (data: unknown): data is unknown[] => {
  return Array.isArray(data);
};

export const makeQueryKey = (operationName: string, variables: Record<string, unknown>) => {
  return `${operationName}(${stringify(variables)})`;
};

export const deepMerge = <T>(source: Partial<T>, data: Partial<T>) => {
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const sourceValue = source[key];
      const dataValue = data[key];

      if (isObject(sourceValue) && isObject(dataValue)) {
        source[key as keyof T] = deepMerge(sourceValue, dataValue) as T[keyof T];
      } else {
        source[key as keyof T] = dataValue as T[keyof T];
      }
    }
  }

  return source;
};

export const transformValue = (value: Value, variables: Variables): unknown => {
  if (value.kind === 'Object') {
    return Object.fromEntries(value.fields.map((field) => [field.name, transformValue(field.value, variables)]));
  } else if (value.kind === 'List') {
    return value.values.map((value) => transformValue(value, variables));
  } else if (value.kind === 'Variable') {
    return variables[value.name];
  } else {
    return value.value;
  }
};

export const transformArguments = (args: Argument[], variables: Variables) => {
  return Object.fromEntries(args.map((argument) => [argument.name, transformValue(argument.value, variables)]));
};
