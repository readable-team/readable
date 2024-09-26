import { db, firstOrThrow, Plans, Sites, Teams } from '@/db';
import { generateRandomAvatar } from '@/utils/image-generation';
import { persistBlobAsImage } from '@/utils/user-contents';

const avatar = await persistBlobAsImage({
  file: await generateRandomAvatar(),
});

await db.transaction(async (tx) => {
  await tx
    .insert(Plans)
    .values({
      id: 'PLAN0000000FREE',
      name: '무료',
      rules: {},
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

  await tx.insert(Sites).values({
    id: 'S000TEMPLATE',
    teamId: team.id,
    name: 'TEMPLATE',
    slug: 'template',
    themeColor: '#ff7b2e',
  });
});
