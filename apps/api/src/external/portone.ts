import { Errors, PortOneApi } from '@portone/server-sdk';
import { env } from '@/env';

const client = PortOneApi(env.PORTONE_API_KEY);

type IssueBillingKeyParams = {
  cardNumber: string;
  expiryYear: string;
  expiryMonth: string;
  birthOrBusinessRegistrationNumber: string;
  passwordTwoDigits: string;
  customerId: string;
};
type IssueBillingKeyResult = {
  billingKey: string;
  card: {
    name: string;
    type: string;
    ownerType: string;
    issuer: string;
    publisher: string;
    brand: string;
    number: string;
  };
};
export const issueBillingKey = async (params: IssueBillingKeyParams): Promise<IssueBillingKeyResult> => {
  const {
    billingKeyInfo: { billingKey },
  } = await client.issueBillingKey(
    {
      card: {
        credential: {
          number: params.cardNumber,
          expiryYear: params.expiryYear,
          expiryMonth: params.expiryMonth,
          birthOrBusinessRegistrationNumber: params.birthOrBusinessRegistrationNumber,
          passwordTwoDigits: params.passwordTwoDigits,
        },
      },
    },
    {
      channelKey: env.PORTONE_CHANNEL_KEY,
      customer: {
        id: params.customerId,
      },
    },
  );

  const resp = await client.getBillingKey(billingKey);

  if (!resp || resp.status !== 'ISSUED' || resp.methods?.[0].type !== 'BillingKeyPaymentMethodCard') {
    throw new Error('Failed to issue billing key');
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const card = resp.methods[0].card!;

  return {
    billingKey,
    card: {
      name: card.name ?? '',
      type: card.type ?? '',
      ownerType: card.ownerType ?? '',
      issuer: card.issuer ?? '',
      publisher: card.publisher ?? '',
      brand: card.brand ?? '',
      number: card.number ?? '',
    },
  };
};

type MakePaymentParams = {
  paymentId: string;
  billingKey: string;
  orderName: string;
  amount: number;
};
type MakePaymentResult =
  | { status: 'succeeded'; approvalNumber: string; receiptUrl: string }
  | { status: 'failed'; reason: string };
export const makePayment = async (params: MakePaymentParams): Promise<MakePaymentResult> => {
  try {
    await client.payWithBillingKey(params.paymentId, {
      billingKey: params.billingKey,
      orderName: params.orderName,
      amount: { total: params.amount },
      currency: 'KRW',
    });
  } catch (err) {
    if (err instanceof Errors.PgProviderError) {
      return {
        status: 'failed',
        reason: err.pgMessage,
      } as const;
    } else if (err instanceof Error) {
      return {
        status: 'failed',
        reason: err.message,
      } as const;
    } else {
      return {
        status: 'failed',
        reason: String(err),
      } as const;
    }
  }

  const payment = await client.getPayment(params.paymentId);

  if (!payment || payment.status !== 'PAID' || payment.method?.type !== 'PaymentMethodCard') {
    throw new Error('Failed to make payment');
  }

  return {
    status: 'succeeded',
    approvalNumber: payment.method.approvalNumber ?? '',
    receiptUrl: payment.receiptUrl ?? '',
  } as const;
};
