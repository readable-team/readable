import * as k8s from '@pulumi/kubernetes';

new k8s.helm.v3.Chart('external-dns', {
  chart: 'external-dns',
  namespace: 'kube-system',
  fetchOpts: { repo: 'https://kubernetes-sigs.github.io/external-dns' },

  values: {
    provider: { name: 'cloudflare' },
    policy: 'sync',

    interval: '1m',
    triggerLoopOnEvent: true,
    sources: ['ingress', 'service'],

    txtOwnerId: 'eks',
    txtPrefix: 'ed.',

    env: [
      {
        name: 'CF_API_TOKEN',
        valueFrom: {
          secretKeyRef: {
            name: 'externaldns',
            key: 'cloudflare-api-token',
          },
        },
      },
    ],
  },
});
