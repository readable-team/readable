import { builder } from '@/builder';
import { MutationError } from '@/errors';

const IMutationError = builder.interfaceRef<MutationError>('MutationError').implement({
  fields: (t) => ({
    message: t.exposeString('message'),
  }),
});

builder.objectType(MutationError, {
  name: 'BaseMutationError',
  interfaces: [IMutationError],
});
