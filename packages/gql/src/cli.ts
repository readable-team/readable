import { writeArtifactAssets, writeMiscAssets, writePublicAssets } from './codegen/writer';
import { buildContext } from './context';

const main = async () => {
  const context = await buildContext();
  await writeArtifactAssets(context.gqlDir, context.schema, context.operationMap, context.fragmentMap);
  await writePublicAssets(context.gqlDir, context.artifacts);
  await writeMiscAssets(context.gqlDir);

  return 0;
};

// eslint-disable-next-line import/no-default-export
export default main;
