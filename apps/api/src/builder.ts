import SchemaBuilder from '@pothos/core';
import DataLoaderPlugin from '@pothos/plugin-dataloader';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects';
import WithInputPlugin from '@pothos/plugin-with-input';
import ZodPlugin from '@pothos/plugin-zod';
import dayjs from 'dayjs';
import { GraphQLJSON } from 'graphql-scalars';
import type { Context, UserContext } from '@/context';

const upperFirst = (s: string) => s[0].toUpperCase() + s.slice(1);

export const builder = new SchemaBuilder<{
  AuthContexts: {
    session: Context & UserContext;
  };
  AuthScopes: {
    session: boolean;
  };
  Context: Context;
  DefaultInputFieldRequiredness: true;
  DefaultFieldNullability: false;
  Scalars: {
    DateTime: { Input: dayjs.Dayjs; Output: dayjs.Dayjs };
    ID: { Input: string; Output: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    JSON: { Input: any; Output: unknown };
  };
}>({
  defaultInputFieldRequiredness: true,
  defaultFieldNullability: false,

  plugins: [ScopeAuthPlugin, DataLoaderPlugin, SimpleObjectsPlugin, WithInputPlugin, ZodPlugin],

  scopeAuth: {
    authScopes: (context) => ({
      session: !!context.session,
    }),
    treatErrorsAsUnauthorized: true,
    // unauthorizedError: (_, __, ___, result) => new PermissionDeniedError(result),
  },

  withInput: {
    typeOptions: {
      name: ({ fieldName }) => `${upperFirst(fieldName)}Input`,
    },
  },

  zod: {
    // validationError: (error) => new IntentionalError(error.issues[0].message),
  },
  // racPluginOptions: {
  //   permissionDeniedError: () => new PermissionDeniedError(),
  // },
});

builder.queryType();
builder.mutationType();
builder.subscriptionType();

builder.addScalarType('JSON', GraphQLJSON);

builder.scalarType('DateTime', {
  serialize: (value) => value.toISOString(),
  parseValue: (value) => {
    if (typeof value === 'string') {
      const d = dayjs(value);
      if (d.isValid()) {
        return d;
      }
    }

    throw new Error('Invalid datetime value');
  },
});

export type Builder = typeof builder;
