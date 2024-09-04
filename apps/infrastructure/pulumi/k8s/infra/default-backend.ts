import * as k8s from '@pulumi/kubernetes';
import { namespace } from '$k8s/infra';

const cm = new k8s.core.v1.ConfigMap('default-backend@infra', {
  metadata: {
    name: 'default-backend',
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
  respond 404
}
    `,
  },
});

const labels = { app: 'default-backend' };

new k8s.apps.v1.Deployment('default-backend@infra', {
  metadata: {
    name: 'default-backend',
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

export const defaultBackendService = new k8s.core.v1.Service('default-backend@infra', {
  metadata: {
    name: 'default-backend',
    namespace: namespace.metadata.name,
  },
  spec: {
    type: 'NodePort',
    selector: labels,
    ports: [{ port: 80 }],
  },
});
