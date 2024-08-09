import * as cloudflare from '@pulumi/cloudflare';

const account = new cloudflare.Account(
  'readable',
  {
    name: 'Readable',
    enforceTwofactor: true,
  },
  { retainOnDelete: true },
);

export { account };
