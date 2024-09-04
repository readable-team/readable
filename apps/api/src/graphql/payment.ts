import { and, eq } from 'drizzle-orm';
import { builder } from '@/builder';
import { db, firstOrThrow, TeamPaymentMethods } from '@/db';
import { TeamMemberRole } from '@/enums';
import { issueBillingKey } from '@/external/portone';
import { dataSchemas } from '@/schemas';
import { assertTeamPermission } from '@/utils/permissions';
import { TeamPaymentMethod } from './objects';

TeamPaymentMethod.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    cardName: t.exposeString('cardName'),
    lastCardNumber: t.exposeString('lastCardNumber'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
  }),
});

builder.mutationFields((t) => ({
  registerCard: t.withAuth({ session: true }).fieldWithInput({
    type: TeamPaymentMethod,
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

      if (result.status === 'failed') {
        throw new Error('Failed to issue billing key');
      }

      return await db.transaction(async (tx) => {
        await tx
          .update(TeamPaymentMethods)
          .set({ state: 'DELETED' })
          .where(and(eq(TeamPaymentMethods.teamId, input.teamId), eq(TeamPaymentMethods.state, 'ACTIVE')));

        return await tx
          .insert(TeamPaymentMethods)
          .values({
            teamId: input.teamId,
            billingKey: result.billingKey,
            cardName: result.card.name,
            lastCardNumber: input.cardNumber.slice(-4),
          })
          .returning()
          .then(firstOrThrow);
      });
    },
  }),
}));
