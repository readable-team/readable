import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

const bucket = new aws.s3.Bucket('billingreports', {
  bucket: 'readable-billingreports',
});

new aws.s3.BucketPolicy('billingreports', {
  bucket: bucket.bucket,
  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { Service: 'billingreports.amazonaws.com' },
        Action: ['s3:GetBucketAcl', 's3:GetBucketPolicy', 's3:PutObject'],
        Resource: [bucket.arn, pulumi.interpolate`${bucket.arn}/*`],
      },
    ],
  },
});

new aws.cur.ReportDefinition('datadog', {
  reportName: 'datadog',
  additionalSchemaElements: ['RESOURCES', 'SPLIT_COST_ALLOCATION_DATA'],

  format: 'Parquet',
  compression: 'Parquet',

  timeUnit: 'HOURLY',
  reportVersioning: 'CREATE_NEW_REPORT',
  refreshClosedReports: true,

  s3Bucket: bucket.bucket,
  s3Region: bucket.region,
  s3Prefix: 'cur',
});
