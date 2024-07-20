import * as jose from 'jose';
import { env } from '@/env';

const jwk = JSON.parse(Buffer.from(env.ACCESS_TOKEN_JWK, 'base64').toString()) as jose.JWK;

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
