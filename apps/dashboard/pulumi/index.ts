import * as pulumi from '@pulumi/pulumi';
import * as readable from '@readable/pulumi';

const config = new pulumi.Config('readable');

const site = new readable.Site('dashboard', {
  name: 'dashboard',

  domain: {
    production: 'app.rdbl.io',
    dev: 'app.rdbl.ninja',
  },

  image: {
    name: '637423633734.dkr.ecr.ap-northeast-2.amazonaws.com/readable',
    digest: config.require('digest'),
    command: ['bun', 'run', 'apps/dashboard/dist/index.js'],
  },

  resources: {
    cpu: '100m',
    memory: '200Mi',
  },

  autoscale: {
    minCount: 2,
    maxCount: 10,
    averageCpuUtilization: 50,
  },

  secret: {
    project: 'dashboard',
  },
});

export const SITE_URL = site.url;
