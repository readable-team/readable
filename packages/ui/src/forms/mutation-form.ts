import { validator } from '@felte/validator-zod';
import { createForm } from 'felte';
import { context } from './context';
import type { Extender, RecursivePartial } from '@felte/core';
import type { AnyZodObject, TypeOf, ZodEffects } from 'zod';

type MutationFormConfig<D, Z extends AnyZodObject> = {
  mutation: (data: TypeOf<Z>) => Promise<D>;
  schema: Z | ZodEffects<Z> | { validate: Z; warn: Z };
  initialValues?: RecursivePartial<TypeOf<Z>>;
  onSuccess?: (data: D) => Promise<void> | void;
  onError?: (error: unknown) => Promise<void> | void;
};

export const createMutationForm = <D, Z extends AnyZodObject>(config: MutationFormConfig<D, Z>) => {
  const extend: Extender<TypeOf<Z>>[] = [context()];
  const { schema, mutation, onSuccess, onError, ...rest } = config;

  if ('validate' in schema && 'warn' in schema) {
    extend.push(
      validator({ schema: schema.validate, level: 'error' }),
      validator({ schema: schema.warn, level: 'warning' }),
    );
  } else {
    extend.push(validator({ schema }));
  }

  return createForm({
    ...rest,
    extend,
    onSubmit: async (values) => {
      const data = await mutation({ ...values });
      await onSuccess?.(data);
    },
    onError: async (error) => {
      await onError?.(error);
    },
  });
};
