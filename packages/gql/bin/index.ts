#!/usr/bin/env bun

import main from '../src/cli';

const code = await main();
process.exit(code);
