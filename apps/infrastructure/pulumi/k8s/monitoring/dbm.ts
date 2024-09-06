// spell-checker:words dbname dbstrict

import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import { db } from '$aws/rds';
import { namespace } from '$k8s/monitoring';

const password = new random.RandomPassword('monitoring/dbm@k8s', {
  length: 20,
  special: false,
});

new k8s.core.v1.Service('dbm', {
  metadata: {
    name: 'dbm',
    namespace: namespace.metadata.name,
    labels: {
      'tags.datadoghq.com/env': 'prod',
      'tags.datadoghq.com/service': 'readable',
    },
    annotations: {
      'ad.datadoghq.com/service.checks': pulumi.jsonStringify({
        postgres: {
          instances: [
            {
              dbm: true,
              host: db.instance.endpoint,
              port: 5432,
              username: 'datadog',
              password: password.result,
              dbname: 'readable',
              dbstrict: true,
              collect_schemas: { enabled: true },
              collect_settings: { enabled: true },
              relations: [{ relation_regex: '.*' }],
            },
          ],
        },
      }),
    },
  },
  spec: {
    clusterIP: 'None',
  },
});

new k8s.core.v1.Service('dbm@dev', {
  metadata: {
    name: 'dbm-dev',
    namespace: namespace.metadata.name,
    labels: {
      'tags.datadoghq.com/env': 'dev',
      'tags.datadoghq.com/service': 'readable',
    },
    annotations: {
      'ad.datadoghq.com/service.checks': pulumi.jsonStringify({
        postgres: {
          instances: [
            {
              dbm: true,
              host: db.dev.instance.endpoint,
              port: 5432,
              username: 'datadog',
              password: password.result,
              dbname: 'readable',
              dbstrict: true,
              collect_schemas: { enabled: true },
              collect_settings: { enabled: true },
              relations: [{ relation_regex: '.*' }],
            },
          ],
        },
      }),
    },
  },
  spec: {
    clusterIP: 'None',
  },
});

export const outputs = {
  K8S_MONITORING_DBM_PASSWORD: password.result,
};
