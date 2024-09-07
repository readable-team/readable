import * as jose from 'jose';
import { base64 } from 'rfc4648';
import { env } from '@/env';

const jwk = JSON.parse(new TextDecoder().decode(base64.parse(env.ACCESS_TOKEN_JWK))) as jose.JWK;

const publicKey = await jose.importJWK({ ...jwk, d: undefined }, jwk.alg);
const privateKey = await jose.importJWK(jwk, jwk.alg);

export const createAccessToken = async (sessionId: string) => {
  return await new jose.SignJWT({})
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .setProtectedHeader({ alg: jwk.alg! })
    .setJti(sessionId)
    .sign(privateKey);
};

export const decodeAccessToken = async (accessToken: string) => {
  const result = await jose.jwtVerify(accessToken, publicKey);
  return result.payload.jti;
};
