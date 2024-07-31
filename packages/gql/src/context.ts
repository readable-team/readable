import path from 'node:path';
import { collectArtifacts } from './artifact';
import type { Context } from './types';

export const buildContext = async (): Promise<Context> => {
  const projectDir = process.cwd();
  const gqlDir = path.join(projectDir, '.gql');

  const { schema, artifacts } = await collectArtifacts(projectDir);

  return { projectDir, gqlDir, schema, artifacts };
};
