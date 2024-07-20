import * as pulumi from '@pulumi/pulumi';
import * as readable from '@readable/pulumi';

const config = new pulumi.Config('readable');

const site = new readable.Site('api', {
  name: 'api',

  domain: {
    production: 'api.rdbl.app',
    dev: 'dev-api.rdbl.app',
  },

  image: {
    name: '637423633734.dkr.ecr.ap-northeast-2.amazonaws.com/readable',
    digest: config.require('digest'),
    command: ['bun', 'run', 'apps/api/src/main.ts'],
  },

  resources: {
    cpu: '1',
    memory: '2000Mi',
  },

  autoscale: {
    minCount: 2,
    maxCount: 10,
    averageCpuUtilization: 50,
  },

  secret: {
    project: 'api',
  },
});

export const SITE_URL = site.url;
