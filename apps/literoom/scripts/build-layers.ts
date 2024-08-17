import fs from 'node:fs/promises';
import { $ } from 'bun';

await fs.rm('dist/layers', { recursive: true });
await fs.mkdir('dist/layers/sharp', { recursive: true });

const $$ = $.cwd('dist/layers/sharp');

// spell-checker:disable-next-line
await $$`npm install --prefix=nodejs --no-save --cpu=arm64 --os=linux --libc=glibc sharp`;
await $$`zip -r ../sharp.zip nodejs`;

await fs.rm('dist/layers/sharp', { recursive: true });

console.log('Sharp layer created');
