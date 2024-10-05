import { match } from 'ts-pattern';
import { PaymentDiscount } from '@/const';
import { BillingCycle } from '@/enums';

type CalculatePaymentAmountParams = {
  fee: number;
  billingCycle: BillingCycle;
};

export const calculatePaymentAmount = ({ fee, billingCycle }: CalculatePaymentAmountParams) => {
  const base = match(billingCycle)
    .with(BillingCycle.MONTHLY, () => fee)
    .with(BillingCycle.YEARLY, () => fee * 12)
    .exhaustive();

  const discount = Math.floor(base * PaymentDiscount[billingCycle]);

  return {
    base,
    discount,
    final: base - discount,
  };
};

export const calculateDetailedAmount = (total: number) => {
  const supply = Math.ceil(total / 1.1);
  const vat = total - supply;

  return {
    total,
    supply,
    vat,
  };
};
