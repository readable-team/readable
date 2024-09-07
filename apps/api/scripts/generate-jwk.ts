#!/usr/bin/env bun

import * as jose from 'jose';
import { base64 } from 'rfc4648';

if (!process.argv[2]) {
  console.error('Usage: bun scripts/generate-jwk.ts <kid>');
  process.exit(1);
}

const alg = 'EdDSA';
const { privateKey } = await jose.generateKeyPair(alg, { extractable: true });

const jwk = await jose.exportJWK(privateKey);

jwk.alg = alg;
jwk.kid = process.argv[2];

console.log('JWK representation:');
console.log(JSON.stringify(jwk, undefined, 2));

console.log();
console.log('Environment variable representation:');
console.log(base64.stringify(new TextEncoder().encode(JSON.stringify(jwk))));
