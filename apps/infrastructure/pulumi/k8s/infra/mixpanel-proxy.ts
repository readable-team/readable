import * as k8s from '@pulumi/kubernetes';
import { namespace } from '$k8s/infra';

const cm = new k8s.core.v1.ConfigMap('mixpanel-proxy@infra', {
  metadata: {
    name: 'mixpanel-proxy',
    namespace: namespace.metadata.name,
  },
  data: {
    Caddyfile: `
{
  admin off
  persist_config off
}

http:// {
  respond /healthz 200
  reverse_proxy https://api.mixpanel.com {
    header_up Host {upstream_hostport}
  }
}
    `,
  },
});

const labels = { app: 'mixpanel-proxy' };

new k8s.apps.v1.Deployment('mixpanel-proxy@infra', {
  metadata: {
    name: 'mixpanel-proxy',
    namespace: namespace.metadata.name,
  },
  spec: {
    replicas: 1,
    selector: { matchLabels: labels },
    template: {
      metadata: { labels },
      spec: {
        containers: [
          {
            name: 'caddy',
            image: 'caddy:2',
            resources: {
              requests: { cpu: '100m' },
              limits: { memory: '100Mi' },
            },
            readinessProbe: {
              httpGet: { path: '/healthz', port: 80 },
            },
            volumeMounts: [{ name: 'cm', mountPath: '/etc/caddy' }],
          },
        ],
        volumes: [{ name: 'cm', configMap: { name: cm.metadata.name } }],
      },
    },
  },
});

const service = new k8s.core.v1.Service('mixpanel-proxy@infra', {
  metadata: {
    name: 'mixpanel-proxy',
    namespace: namespace.metadata.name,
  },
  spec: {
    type: 'NodePort',
    selector: labels,
    ports: [{ port: 80 }],
  },
});

new k8s.networking.v1.Ingress('mixpanel-proxy@infra', {
  metadata: {
    name: 'mixpanel-proxy',
    namespace: namespace.metadata.name,
    annotations: {
      'alb.ingress.kubernetes.io/group.name': 'public-alb',
      'alb.ingress.kubernetes.io/listen-ports': JSON.stringify([{ HTTPS: 443 }]),
      'alb.ingress.kubernetes.io/healthcheck-path': '/healthz',
      'pulumi.com/skipAwait': 'true',
    },
  },
  spec: {
    ingressClassName: 'alb',
    rules: [
      {
        host: 't.rdbl.app',
        http: {
          paths: [
            {
              path: '/',
              pathType: 'Prefix',
              backend: {
                service: {
                  name: service.metadata.name,
                  port: { number: service.spec.ports[0].port },
                },
              },
            },
          ],
        },
      },
    ],
  },
});
