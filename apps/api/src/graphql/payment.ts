import { builder } from '@/builder';
import { TeamMemberRole } from '@/enums';
import { issueBillingKey } from '@/external/portone';
import { dataSchemas } from '@/schemas';
import { assertTeamPermission } from '@/utils/permissions';

builder.mutationFields((t) => ({
  registerCard: t.withAuth({ session: true }).fieldWithInput({
    type: 'Boolean',
    input: {
      teamId: t.input.string(),
      cardNumber: t.input.string({
        validate: { schema: dataSchemas.card.number },
      }),
      expiry: t.input.string({
        validate: { schema: dataSchemas.card.expiry },
      }),
      birthOrBusinessRegistrationNumber: t.input.string({
        validate: { schema: dataSchemas.card.birthOrBusinessRegistrationNumber },
      }),
      passwordTwoDigits: t.input.string({
        validate: { schema: dataSchemas.card.passwordTwoDigits },
      }),
    },
    resolve: async (_, { input }, ctx) => {
      await assertTeamPermission({
        teamId: input.teamId,
        userId: ctx.session.userId,
        role: TeamMemberRole.ADMIN,
      });

      const [, expiryMonth, expiryYear] = input.expiry.match(/^(\d{2})(\d{2})$/) || [];

      const result = await issueBillingKey({
        cardNumber: input.cardNumber,
        expiryYear,
        expiryMonth,
        birthOrBusinessRegistrationNumber: input.birthOrBusinessRegistrationNumber,
        passwordTwoDigits: input.passwordTwoDigits,
        customerId: input.teamId,
      });

      console.log(result);

      return true;
    },
  }),
}));
