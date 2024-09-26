import { builder } from '@/builder';
import { logToSlack } from '@/utils/slack';

builder.mutationFields((t) => ({
  requestInquiry: t.fieldWithInput({
    type: 'Boolean',
    input: {
      name: t.input.string(),
      email: t.input.string({ validate: { email: true } }),
      tel: t.input.string({ required: false }),
      companyName: t.input.string({ required: false }),
      title: t.input.string({ required: false }),
    },
    resolve: async (_, { input }) => {
      logToSlack('inquiry', {
        name: input.name,
        email: input.email,
        tel: input.tel,
        companyName: input.companyName,
        title: input.title,
      });

      return true;
    },
  }),
}));
