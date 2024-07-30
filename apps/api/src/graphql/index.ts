import './objects';
import './errors';
import './enums';
import './auth';
import './blob';
import './workspace';

import { builder } from '@/builder';
import { dev } from '@/env';

export const schema = builder.toSchema();

if (dev) {
  const { writeFileSync } = await import('node:fs');
  const { lexicographicSortSchema, printSchema } = await import('graphql');
  writeFileSync('schema.graphql', `${printSchema(lexicographicSortSchema(schema))}\n`);
}
