#!/usr/bin/env bun

import * as jose from 'jose';

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
console.log(Buffer.from(JSON.stringify(jwk)).toString('base64'));
