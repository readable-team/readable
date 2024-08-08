import { ms } from '@/search';

await ms.deleteIndexIfExists('pages');
await ms.createIndex('pages', {
  primaryKey: 'id',
});

const index = ms.index('pages');
await index.updateSettings({
  filterableAttributes: ['siteId', 'state'],
  searchableAttributes: ['title', 'subtitle', 'text'],
  typoTolerance: { enabled: false },
});

console.log('Index resetted');
