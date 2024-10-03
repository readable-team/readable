import dayjs from 'dayjs';
import { desc, eq } from 'drizzle-orm';
import { match } from 'ts-pattern';
import { db, first, PaymentInvoices, TeamPlans } from '@/db';
import { BillingCycle } from '@/enums';

export const getNextBillingDate = async (teamId: string) => {
  const today = dayjs().utc().startOf('day');

  const planPaymentInfo = await db
    .select({
      billingCycle: TeamPlans.billingCycle,
      enrolledAt: TeamPlans.enrolledAt,
    })
    .from(TeamPlans)
    .where(eq(TeamPlans.teamId, teamId))
    .then(first);

  if (!planPaymentInfo) {
    return today;
  }

  const unit = match(planPaymentInfo.billingCycle)
    .with(BillingCycle.MONTHLY, () => 'month' as const)
    .with(BillingCycle.YEARLY, () => 'year' as const)
    .exhaustive();

  const lastInvoice = await db
    .select({ createdAt: PaymentInvoices.createdAt })
    .from(PaymentInvoices)
    .where(eq(PaymentInvoices.teamId, teamId))
    .orderBy(desc(PaymentInvoices.createdAt))
    .then(first);

  if (lastInvoice) {
    const lastInvoiceDate = lastInvoice.createdAt.utc().startOf('day');

    if (lastInvoiceDate.isBefore(today, 'day') || lastInvoiceDate.isSame(today, 'day')) {
      return lastInvoiceDate;
    }
  }

  const paymentSeq = Math.ceil(today.diff(planPaymentInfo.enrolledAt.utc(), unit, true));

  return planPaymentInfo.enrolledAt.startOf('day').add(paymentSeq, unit);
};
