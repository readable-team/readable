import * as tailscale from '@pulumi/tailscale';

const authKey = new tailscale.TailnetKey('penxle.io', {
  reusable: true,
  ephemeral: true,
  recreateIfInvalid: 'always',
  tags: ['tag:infrastructure'],
});

export const tailnet = {
  authKey: authKey.key,
};

export const outputs = {};
