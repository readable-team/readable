import * as pulumi from '@pulumi/pulumi';
import * as readable from '@readable/pulumi';

const config = new pulumi.Config('readable');

const site = new readable.Site('usersite', {
  name: 'usersite',

  domain: {
    production: '*.rdbl.io',
    dev: '*.rdbl.ninja',
  },

  image: {
    name: '637423633734.dkr.ecr.ap-northeast-2.amazonaws.com/readable',
    digest: config.require('digest'),
    command: ['bun', 'run', 'apps/usersite/dist/index.js'],
  },

  resources: {
    cpu: '200m',
    memory: '500Mi',
  },

  autoscale: {
    minCount: 2,
    maxCount: 10,
    averageCpuUtilization: 50,
  },
});

export const SITE_URL = site.url;
