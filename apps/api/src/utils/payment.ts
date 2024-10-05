import dayjs from 'dayjs';
import { desc, eq } from 'drizzle-orm';
import { match } from 'ts-pattern';
import { db, first, PaymentInvoices, TeamPlans } from '@/db';
import { BillingCycle } from '@/enums';

const getLastInvoiceDate = async (teamId: string) => {
  const lastInvoice = await db
    .select({ createdAt: PaymentInvoices.createdAt })
    .from(PaymentInvoices)
    .where(eq(PaymentInvoices.teamId, teamId))
    .orderBy(desc(PaymentInvoices.createdAt))
    .then(first);

  return lastInvoice?.createdAt;
};

export const getNextBillingInfo = async (teamId: string) => {
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
    return {
      nextPaymentAt: today,
    };
  }

  const unit = match(planPaymentInfo.billingCycle)
    .with(BillingCycle.MONTHLY, () => 'month' as const)
    .with(BillingCycle.YEARLY, () => 'year' as const)
    .exhaustive();

  const lastInvoiceDate = await getLastInvoiceDate(teamId);

  if (lastInvoiceDate?.isAfter(today, 'day') || lastInvoiceDate?.isSame(today, 'day')) {
    return {
      nextPaymentAt: lastInvoiceDate,
      billingCycle: planPaymentInfo.billingCycle,
    };
  }

  const paymentSeq = Math.ceil(today.diff(planPaymentInfo.enrolledAt.utc(), unit, true));

  return {
    nextPaymentAt: planPaymentInfo.enrolledAt.utc().startOf('day').add(paymentSeq, unit),
    billingCycle: planPaymentInfo.billingCycle,
  };
};

type CalculateProratedFeeParams = {
  fee: number;
  teamId: string;
};

export const calculateProratedFee = async ({ fee, teamId }: CalculateProratedFeeParams) => {
  const { nextPaymentAt, billingCycle } = await getNextBillingInfo(teamId);
  const today = dayjs().utc();

  if (nextPaymentAt.isBefore(today, 'day') || nextPaymentAt.isSame(today, 'day')) {
    return fee;
  }

  const lastInvoiceDate = await getLastInvoiceDate(teamId);

  const diff = nextPaymentAt.diff(today, 'day');
  const invoiceDiff = nextPaymentAt.diff(lastInvoiceDate, 'day');

  const proratedFee = fee * (diff / invoiceDiff) * (billingCycle === BillingCycle.YEARLY ? 10 : 1);

  return Math.ceil(proratedFee);
};
