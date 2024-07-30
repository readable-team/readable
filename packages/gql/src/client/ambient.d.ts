declare module '$gql/client' {
  import { GqlClient } from '.';

  const factory: () => GqlClient;

  // eslint-disable-next-line import/no-default-export
  export default factory;
}
