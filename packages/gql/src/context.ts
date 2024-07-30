import path from 'node:path';
import { collectArtifacts } from './artifact';
import type { Context } from './types';

export const buildContext = async (): Promise<Context> => {
  const projectDir = process.cwd();
  const gqlDir = path.join(projectDir, '.gql');

  const { schema, operationMap, fragmentMap } = await collectArtifacts(projectDir);
  const artifacts = [...operationMap.values(), ...fragmentMap.values()];

  return { projectDir, gqlDir, schema, operationMap, fragmentMap, artifacts };
};
