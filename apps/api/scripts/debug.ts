import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { parse, stringify } from 'devalue';
import type { AppRouter } from '@/router';

const rl = createInterface({ input: stdin, output: stdout });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `http://localhost:3000/trpc`,
      transformer: {
        serialize: stringify,
        deserialize: parse,
      },
      fetch: (input, init) => {
        // const token = get(accessToken);

        return fetch(input, {
          ...init,
          credentials: 'include',
          headers: {
            ...init?.headers,
            // ...(token && { authorization: `Bearer ${token}` }),
          },
        });
      },
    }),
  ],
});

let command = '';
console.log('Readable tRPC Debugger');
console.log('Type ".exit" to exit');
// eslint-disable-next-line no-constant-condition
while (true) {
  command = await rl.question('> ');

  if (command === '.exit') {
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(0);
  }

  const result = eval(`trpc.${command}`);
  console.log(await result);
}
