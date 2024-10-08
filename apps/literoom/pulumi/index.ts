import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

const role = new aws.iam.Role('literoom@lambda', {
  name: 'literoom@lambda',
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: 'lambda.amazonaws.com',
  }),
  managedPolicyArns: [aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole],
});

const sharpLayer = new aws.lambda.LayerVersion('sharp', {
  layerName: 'sharp',
  compatibleRuntimes: ['nodejs20.x'],
  compatibleArchitectures: ['arm64'],
  code: new pulumi.asset.FileArchive('../dist/layers/sharp.zip'),
});

const lambda = new aws.lambda.Function('literoom', {
  name: 'literoom',
  role: role.arn,

  architectures: ['arm64'],

  memorySize: 10_240,
  timeout: 900,

  runtime: 'nodejs20.x',
  handler: 'handler.handler',
  layers: [sharpLayer.arn],

  code: new pulumi.asset.FileArchive('../dist/function'),
});

new aws.lambda.Permission('literoom', {
  function: lambda.name,
  principal: 'cloudfront.amazonaws.com',
  action: 'lambda:InvokeFunction',
});

const accessPoint = new aws.s3.AccessPoint('usercontents', {
  name: 'usercontents',
  bucket: 'readable-usercontents',
});

new aws.s3control.AccessPointPolicy('usercontents', {
  accessPointArn: accessPoint.arn,
  policy: accessPoint.arn.apply((v) =>
    JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { Service: 'cloudfront.amazonaws.com' },
          Action: 's3:*',
          Resource: [v, `${v}/object/*`],
        },
      ],
    }),
  ),
});

const objectLambdaAccessPoint = new aws.s3control.ObjectLambdaAccessPoint('usercontents-literoom', {
  name: 'usercontents-literoom',
  configuration: {
    supportingAccessPoint: accessPoint.arn,
    transformationConfigurations: [
      {
        actions: ['GetObject'],
        contentTransformation: {
          awsLambda: {
            functionArn: lambda.arn,
          },
        },
      },
    ],
  },
});

new aws.s3control.ObjectLambdaAccessPointPolicy('usercontents-literoom', {
  name: 'usercontents-literoom',
  policy: objectLambdaAccessPoint.arn.apply((v) =>
    JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { Service: 'cloudfront.amazonaws.com' },
          Action: 's3-object-lambda:Get*',
          Resource: v,
        },
      ],
    }),
  ),
});

new aws.iam.RolePolicy('literoom@lambda', {
  name: 'literoom@lambda',
  role: role.name,

  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: ['s3-object-lambda:WriteGetObjectResponse'],
        Resource: [objectLambdaAccessPoint.arn],
      },
    ],
  },
});

export const IMAGES_ACCESS_POINT_ALIAS = objectLambdaAccessPoint.alias;
