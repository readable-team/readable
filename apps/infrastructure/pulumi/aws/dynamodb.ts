import * as aws from '@pulumi/aws';

const externalDns = new aws.dynamodb.Table('external-dns', {
  name: 'external-dns',
  billingMode: 'PAY_PER_REQUEST',

  hashKey: 'k',
  attributes: [{ name: 'k', type: 'S' }],
});

const usersiteProxy = new aws.dynamodb.Table('usersite-proxy', {
  name: 'usersite-proxy',
  billingMode: 'PAY_PER_REQUEST',

  hashKey: 'PrimaryKey',
  attributes: [{ name: 'PrimaryKey', type: 'S' }],
});

export const tables = {
  externalDns,
};

export const outputs = {
  AWS_DYNAMODB_USERSITE_PROXY_ARN: usersiteProxy.arn,
};
