import * as aws from '@pulumi/aws';

const usersiteProxy = new aws.dynamodb.Table('usersite-proxy', {
  name: 'usersite-proxy',
  billingMode: 'PAY_PER_REQUEST',

  hashKey: 'PrimaryKey',
  attributes: [{ name: 'PrimaryKey', type: 'S' }],
});

export const outputs = {
  AWS_DYNAMODB_USERSITE_PROXY_ARN: usersiteProxy.arn,
};
