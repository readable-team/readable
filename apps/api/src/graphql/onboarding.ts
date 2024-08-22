import { builder } from '@/builder';

builder.mutationFields((t) => ({
  submitOnboardingSurvey: t.withAuth({ session: true }).fieldWithInput({
    type: 'Boolean',
    input: {
      purpose: t.input.string({ required: false }),
      occupation: t.input.string({ required: false }),
    },
    resolve: () => {
      return true;
    },
  }),
}));
