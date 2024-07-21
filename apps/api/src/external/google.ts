import { OAuth2Client } from 'google-auth-library';
import { SingleSignOnProvider } from '@/enums';
import { env } from '@/env';

const createOAuthClient = () => {
  return new OAuth2Client({
    clientId: env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri: `${env.DASHBOARD_URL}/auth/sso/google`,
  });
};

export const generateAuthorizationUrl = () => {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    scope: ['email', 'profile'],
  });
};

export const authorizeUser = async (code: string) => {
  const client = createOAuthClient();

  const { tokens } = await client.getToken({ code });
  if (!tokens.access_token) {
    throw new Error('Token validation failed');
  }

  const { aud } = await client.getTokenInfo(tokens.access_token);
  if (aud !== env.GOOGLE_OAUTH_CLIENT_ID) {
    throw new Error('Token validation failed');
  }

  client.setCredentials(tokens);

  type R = { sub: string; email: string; name: string; picture: string };
  const userinfo = await client.request<R>({
    url: 'https://www.googleapis.com/oauth2/v3/userinfo',
  });

  return {
    provider: SingleSignOnProvider.GOOGLE,
    id: userinfo.data.sub,
    email: userinfo.data.email,
    name: userinfo.data.name,
    avatarUrl: userinfo.data.picture,
  };
};
