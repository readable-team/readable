import { builder } from '@/builder';
import { logToSlack } from '@/utils/slack';

builder.mutationFields((t) => ({
  createFeedback: t.withAuth({ session: true }).fieldWithInput({
    type: 'Boolean',
    input: {
      content: t.input.string(),
    },
    resolve: async (_, { input }) => {
      logToSlack('feedback', {
        content: input.content,
      });

      return true;
    },
  }),
}));
