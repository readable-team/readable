import { ms, searchIndex, searchIndexName } from '@/search';

await ms.deleteIndexIfExists(searchIndexName('pages'));
await ms.createIndex(searchIndexName('pages'), {
  primaryKey: 'id',
});

const index = searchIndex('pages');
await index.updateSettings({
  filterableAttributes: ['siteId', 'state'],
  searchableAttributes: ['title', 'subtitle', 'text'],
  typoTolerance: { enabled: false },
});

console.log('Index resetted');
