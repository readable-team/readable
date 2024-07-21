import * as pulumi from '@pulumi/pulumi';
import * as readable from '@readable/pulumi';

const config = new pulumi.Config('readable');

const site = new readable.Site('website', {
  name: 'website',

  domain: {
    production: 'rdbl.io',
    dev: 'rdbl.ninja',
  },

  cloudfront: {
    certificateArnRef: 'AWS_ACM_CLOUDFRONT_RDBL_IO_CERTIFICATE_ARN',
    domainZone: 'rdbl.io',
  },

  image: {
    name: '637423633734.dkr.ecr.ap-northeast-2.amazonaws.com/readable',
    digest: config.require('digest'),
    command: ['bun', 'run', 'apps/website/dist/index.js'],
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
});

export const SITE_URL = site.url;
