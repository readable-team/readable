import * as k8s from '@pulumi/kubernetes';

new k8s.core.v1.Namespace('dev', {
  metadata: {
    name: 'dev',
  },
});

new k8s.core.v1.Namespace('prod', {
  metadata: {
    name: 'prod',
  },
});
