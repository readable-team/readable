import fg from 'fast-glob';

const index = async () => {
  const paths = await fg('**/*.ts', {
    absolute: true,
    ignore: ['index.ts'],
  });

  const imports = paths.map((path) => import(path));
  const outputs = imports.map((i) => i.then(({ outputs }: { outputs: Record<string, unknown> }) => outputs));

  const awaited = await Promise.all(outputs);

  return Object.assign({}, ...awaited);
};

// eslint-disable-next-line import/no-default-export
export default index();
