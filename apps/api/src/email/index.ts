import { Resend } from 'resend';
import { env } from '@/env';
import type * as React from 'react';

const resend = new Resend(env.RESEND_API_KEY);

type SendEmailParams = {
  subject: string;
  recipient: string;
  body: React.ReactNode;
};

export const sendEmail = async ({ subject, recipient, body }: SendEmailParams) => {
  await resend.emails.send({
    from: 'Readable <hello@rdbl.io>',
    to: recipient,
    subject,
    react: body,
  });
};
