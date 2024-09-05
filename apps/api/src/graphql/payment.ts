import { and, eq } from 'drizzle-orm';
import { builder } from '@/builder';
import { db, firstOrThrow, PaymentMethods } from '@/db';
import { TeamMemberRole } from '@/enums';
import { issueBillingKey } from '@/external/portone';
import { dataSchemas } from '@/schemas';
import { assertTeamPermission } from '@/utils/permissions';
import { PaymentMethod } from './objects';

PaymentMethod.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
  }),
});

builder.mutationFields((t) => ({
  updatePaymentMethod: t.withAuth({ session: true }).fieldWithInput({
    type: PaymentMethod,
    input: {
      teamId: t.input.string(),
      cardNumber: t.input.string({ validate: { schema: dataSchemas.card.number } }),
      expiry: t.input.string({ validate: { schema: dataSchemas.card.expiry } }),
      birthOrBusinessRegistrationNumber: t.input.string({
        validate: { schema: dataSchemas.card.birthOrBusinessRegistrationNumber },
      }),
      passwordTwoDigits: t.input.string({ validate: { schema: dataSchemas.card.passwordTwoDigits } }),
    },
    resolve: async (_, { input }, ctx) => {
      await assertTeamPermission({
        teamId: input.teamId,
        userId: ctx.session.userId,
        role: TeamMemberRole.ADMIN,
      });

      const [, expiryMonth, expiryYear] = input.expiry.match(/^(\d{2})(\d{2})$/) || [];

      const result = await issueBillingKey({
        customerId: input.teamId,
        cardNumber: input.cardNumber,
        expiryYear,
        expiryMonth,
        birthOrBusinessRegistrationNumber: input.birthOrBusinessRegistrationNumber,
        passwordTwoDigits: input.passwordTwoDigits,
      });

      if (result.status === 'failed') {
        throw new Error('Failed to issue billing key');
      }

      return await db.transaction(async (tx) => {
        await tx
          .update(PaymentMethods)
          .set({ state: 'DEACTIVATED' })
          .where(and(eq(PaymentMethods.teamId, input.teamId), eq(PaymentMethods.state, 'ACTIVE')));

        return await tx
          .insert(PaymentMethods)
          .values({
            teamId: input.teamId,
            name: `${result.card.name} ${input.cardNumber.slice(-4)}`,
            billingKey: result.billingKey,
          })
          .returning()
          .then(firstOrThrow);
      });
    },
  }),
}));
