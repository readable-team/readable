import { writeArtifactAssets, writeMiscAssets, writePublicAssets, writeTypeAssets } from './codegen/writer';
import { buildContext } from './context';

const main = async () => {
  const context = await buildContext();
  await writeArtifactAssets(context);
  await writePublicAssets(context);
  await writeMiscAssets(context);
  await writeTypeAssets(context);

  return 0;
};

// eslint-disable-next-line import/no-default-export
export default main;
