import * as pulumi from '@pulumi/pulumi';
import * as readable from '@readable/pulumi';

const config = new pulumi.Config('readable');

const ref = new pulumi.StackReference('readable/infrastructure/base');

const site = new readable.Site('api', {
  name: 'api',

  domain: {
    production: 'api.rdbl.io',
    dev: 'api.rdbl.ninja',
  },

  image: {
    name: '637423633734.dkr.ecr.ap-northeast-2.amazonaws.com/readable',
    digest: config.require('digest'),
    command: ['bun', 'run', 'apps/api/src/main.ts'],
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

  iam: {
    policy: {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: ['s3:GetObject', 's3:PutObject'],
          Resource: [pulumi.concat(ref.requireOutput('AWS_S3_BUCKET_UPLOADS_ARN'), '/*')],
        },
        {
          Effect: 'Allow',
          Action: ['s3:PutObject'],
          Resource: [pulumi.concat(ref.requireOutput('AWS_S3_BUCKET_USERCONTENTS_ARN'), '/*')],
        },
      ],
    },
  },

  secret: {
    project: 'api',
  },
});

export const SITE_URL = site.url;
