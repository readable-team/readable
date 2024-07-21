import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

const cdn = new aws.s3.Bucket('cdn', {
  bucket: 'readable-cdn',
});

new aws.s3.BucketPolicy('cdn', {
  bucket: cdn.bucket,
  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { Service: 'cloudfront.amazonaws.com' },
        Action: ['s3:GetObject'],
        Resource: [pulumi.interpolate`${cdn.arn}/*`],
      },
    ],
  },
});

const usercontents = new aws.s3.Bucket('usercontents', {
  bucket: 'readable-usercontents',
  corsRules: [
    {
      allowedHeaders: ['*'],
      allowedMethods: ['PUT'],
      allowedOrigins: ['https://app.rdbl.io', 'https://app.rdbl.ninja', 'http://localhost:4100'],
    },
  ],
});

new aws.s3.BucketPolicy('usercontents', {
  bucket: usercontents.bucket,
  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { Service: 'cloudfront.amazonaws.com' },
        Action: ['s3:GetObject'],
        Resource: [pulumi.interpolate`${usercontents.arn}/public/*`],
      },
    ],
  },
});

export const buckets = { cdn, usercontents };

export const outputs = {
  AWS_S3_BUCKET_CDN_BUCKET: cdn.bucket,
  AWS_S3_BUCKET_USERCONTENTS_BUCKET: usercontents.bucket,

  AWS_S3_BUCKET_CDN_ARN: cdn.arn,
  AWS_S3_BUCKET_USERCONTENTS_ARN: usercontents.arn,
};
