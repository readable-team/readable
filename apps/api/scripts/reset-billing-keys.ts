import * as portone from '@/external/portone';

const billingKeys = await portone.client.getBillingKeys(0, 1000, { filter: { status: ['ISSUED'] } });
console.log(`Found ${billingKeys.length} billing keys`);

for (const billingKey of billingKeys) {
  await portone.client.deleteBillingKey(billingKey.billingKey);
  console.log(`Deleted billing key: ${billingKey.billingKey}`);
}
