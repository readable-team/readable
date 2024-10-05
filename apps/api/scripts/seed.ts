import { Addons, db, firstOrThrow, Plans, Sites, TeamPlans, Teams } from '@/db';
import { BillingCycle, PlanType } from '@/enums';
import { generateRandomAvatar } from '@/utils/image-generation';
import { persistBlobAsImage } from '@/utils/user-contents';

const avatar = await persistBlobAsImage({
  file: await generateRandomAvatar(),
});

await db.transaction(async (tx) => {
  await tx.insert(Addons).values({
    id: 'ADD0WHITELABEL',
    name: '화이트라벨링',
    fee: 22_000,
  });

  await tx.insert(Plans).values({
    id: 'PLAN0STARTER',
    name: 'Starter',
    rules: {},
    order: 1,
  });

  await tx.insert(Plans).values({
    id: 'PLAN0LITE',
    name: 'Lite',
    fee: 3300,
    rules: {
      memberLimit: 3,
      siteLimit: null,
      pageViewLimit: null,
      themeColor: true,
      customDomain: true,
    },
    order: 2,
  });

  await tx.insert(Plans).values({
    id: 'PLAN0PRO',
    name: 'Pro',
    fee: 33_000,
    rules: {
      memberLimit: 10,
      siteLimit: null,
      pageViewLimit: null,
      themeColor: true,
      customDomain: true,
      aiSearch: true,
      addonsAvailable: ['ADD0WHITELABEL'],
    },
    order: 3,
  });

  const plan = await tx
    .insert(Plans)
    .values({
      id: 'PLAN0PENXLE',
      name: 'PENXLE',
      rules: {
        memberLimit: null,
        siteLimit: null,
        pageViewLimit: null,
        aiSearch: true,
      },
      type: PlanType.PRIVATE,
    })
    .returning({ id: Plans.id })
    .then(firstOrThrow);

  const team = await tx
    .insert(Teams)
    .values({
      id: 'T00000PENXLE',
      name: 'PENXLE',
      avatarId: avatar.id,
    })
    .returning({ id: Teams.id })
    .then(firstOrThrow);

  await tx.insert(TeamPlans).values({
    teamId: team.id,
    planId: plan.id,
    billingCycle: BillingCycle.MONTHLY,
    billingEmail: 'billing@penxle.io',
  });

  await tx.insert(Sites).values({
    id: 'S000TEMPLATE',
    teamId: team.id,
    name: 'TEMPLATE',
    slug: 'template',
    themeColor: '#ff7b2e',
  });
});
