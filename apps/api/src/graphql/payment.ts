import { and, eq } from 'drizzle-orm';
import { builder } from '@/builder';
import {
  db,
  first,
  firstOrThrow,
  PaymentInvoices,
  PaymentMethods,
  PaymentRecords,
  Plans,
  TeamPlans,
  Teams,
} from '@/db';
import { BillingCycle, PaymentInvoiceState, PaymentMethodState, PaymentRecordState, TeamMemberRole } from '@/enums';
import { ReadableError } from '@/errors';
import * as portone from '@/external/portone';
import { dataSchemas } from '@/schemas';
import { assertTeamPermission } from '@/utils/permissions';
import { PaymentMethod, PaymentRecord, Team } from './objects';

const UPGRADABLE_PLAN_ID = 'PLAN000000TEAM';

PaymentMethod.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
  }),
});

PaymentRecord.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    state: t.expose('state', { type: PaymentRecordState }),
    amount: t.exposeInt('amount'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),

    paymentMethod: t.field({
      type: PaymentMethod,
      resolve: (record) => record.methodId,
    }),
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

      const result = await portone.issueBillingKey({
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
        const methods = await tx
          .update(PaymentMethods)
          .set({ state: PaymentMethodState.DEACTIVATED })
          .where(and(eq(PaymentMethods.teamId, input.teamId), eq(PaymentMethods.state, PaymentMethodState.ACTIVE)))
          .returning({ billingKey: PaymentMethods.billingKey });

        for (const method of methods) {
          await portone.deleteBillingKey({ billingKey: method.billingKey });
        }

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

  upgradePlan: t.withAuth({ session: true }).fieldWithInput({
    type: Team,
    input: {
      teamId: t.input.string(),
      billingCycle: t.input.field({ type: BillingCycle }),
    },
    resolve: async (_, { input }, ctx) => {
      await assertTeamPermission({
        teamId: input.teamId,
        userId: ctx.session.userId,
        role: TeamMemberRole.ADMIN,
      });

      const teamPlan = await db
        .select({
          team: Teams,
          id: TeamPlans.planId,
        })
        .from(Teams)
        .leftJoin(TeamPlans, eq(TeamPlans.teamId, Teams.id))
        .where(eq(Teams.id, input.teamId))
        .then(firstOrThrow);

      if (teamPlan.id) {
        throw new ReadableError({ code: 'already_upgraded' });
      }

      const paymentMethod = await db
        .select({
          id: PaymentMethods.id,
          billingKey: PaymentMethods.billingKey,
        })
        .from(PaymentMethods)
        .where(and(eq(PaymentMethods.teamId, input.teamId), eq(PaymentMethods.state, PaymentMethodState.ACTIVE)))
        .then(first);

      if (!paymentMethod) {
        throw new ReadableError({ code: 'payment_method_not_found' });
      }

      const plan = await db
        .select({
          fee: Plans.fee,
        })
        .from(Plans)
        .where(eq(Plans.id, UPGRADABLE_PLAN_ID))
        .then(firstOrThrow);

      const paymentAmount = input.billingCycle === BillingCycle.MONTHLY ? plan.fee : plan.fee * 10;

      await db.transaction(async (tx) => {
        // 결제 실패하면 롤백되서 플랜 변경 자체가 없던 일이 됨 -> 그래서 일단 COMPLETED

        const invoice = await db
          .insert(PaymentInvoices)
          .values({
            teamId: input.teamId,
            amount: paymentAmount,
            state: PaymentInvoiceState.COMPLETED,
          })
          .returning({ id: PaymentInvoices.id })
          .then(firstOrThrow);

        const record = await db
          .insert(PaymentRecords)
          .values({
            teamId: input.teamId,
            methodId: paymentMethod.id,
            invoiceId: invoice.id,
            amount: paymentAmount,
            state: PaymentRecordState.COMPLETED,
          })
          .returning()
          .then(firstOrThrow);

        await tx.insert(TeamPlans).values({
          teamId: input.teamId,
          planId: UPGRADABLE_PLAN_ID,
          billingCycle: input.billingCycle,
        });

        const paymentResult = await portone.makePayment({
          billingKey: paymentMethod.billingKey,
          amount: paymentAmount,
          customerName: teamPlan.team.name,
          orderName: '리더블 정기결제',
          paymentId: record.id,
        });

        if (paymentResult.status === 'failed') {
          await tx
            .update(PaymentRecords)
            .set({ state: PaymentRecordState.FAILED })
            .where(eq(PaymentRecords.id, record.id));
          throw new ReadableError({ code: 'payment_failed' });
        }
      });

      return teamPlan.team;
    },
  }),
}));
