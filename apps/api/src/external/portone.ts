import ky from 'ky';
import { env } from '@/env';

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
  };
};
export const issueBillingKey = async (params: IssueBillingKeyParams): Promise<IssueBillingKeyResult> => {
  const {
    billingKeyInfo: { billingKey },
  } = await ky
    .post('https://api.portone.io/billing-keys', {
      headers: {
        Authorization: `PortOne ${env.PORTONE_API_KEY}`,
      },
      json: {
        channelKey: env.PORTONE_CHANNEL_KEY,
        method: {
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
        customer: {
          id: params.customerId,
        },
      },
    })
    .then((res) => res.json<{ billingKeyInfo: { billingKey: string } }>());

  const resp = await ky
    .get(`https://api.portone.io/billing-keys/${billingKey}`, {
      headers: {
        Authorization: `PortOne ${env.PORTONE_API_KEY}`,
      },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((res) => res.json<any>());

  if (resp.status !== 'ISSUED') {
    throw new Error('Failed to issue billing key');
  }

  const card = resp.methods[0].card;

  return {
    billingKey,
    card: {
      name: card.name,
      type: card.type,
      ownerType: card.ownerType,
      issuer: card.issuer,
      publisher: card.publisher,
      brand: card.brand,
    },
  };
};

type MakePaymentParams = {
  billingKey: string;
  paymentId: string;
  orderName: string;
  amount: number;
};
type MakePaymentResult =
  | { status: 'succeeded'; approvalNumber: string; receiptUrl: string }
  | { status: 'failed'; reason: string };
export const makePayment = async (params: MakePaymentParams): Promise<MakePaymentResult> => {
  const resp = await ky.post(`https://api.portone.io/payments/${params.paymentId}/billing-key`, {
    throwHttpErrors: false,
    headers: {
      Authorization: `PortOne ${env.PORTONE_API_KEY}`,
    },
    json: {
      billingKey: params.billingKey,
      orderName: params.orderName,
      amount: {
        total: params.amount,
      },
      currency: 'KRW',
    },
  });

  if (resp.status !== 200) {
    const { pgMessage } = await resp.json<{ pgMessage: string }>();
    return {
      status: 'failed',
      reason: pgMessage,
    } as const;
  }

  const payment = await ky
    .get(`https://api.portone.io/payments/${params.paymentId}`, {
      headers: {
        Authorization: `PortOne ${env.PORTONE_API_KEY}`,
      },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((res) => res.json<any>());

  if (payment.status !== 'PAID') {
    throw new Error('Failed to make payment');
  }

  return {
    status: 'succeeded',
    approvalNumber: payment.method.approvalNumber,
    receiptUrl: payment.receiptUrl,
  } as const;
};
