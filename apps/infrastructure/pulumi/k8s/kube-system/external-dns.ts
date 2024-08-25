import * as aws from '@pulumi/aws';
import * as k8s from '@pulumi/kubernetes';
import { cluster } from '$aws/eks';

const role = new aws.iam.Role('external-dns@eks', {
  name: 'external-dns@eks',
  assumeRolePolicy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { Service: 'pods.eks.amazonaws.com' },
        Action: ['sts:AssumeRole', 'sts:TagSession'],
      },
    ],
  },
});

new aws.iam.RolePolicy('external-dns@eks', {
  role: role.name,
  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: ['route53:ChangeResourceRecordSets'],
        Resource: ['arn:aws:route53:::hostedzone/*'],
      },
      {
        Effect: 'Allow',
        Action: ['route53:ListHostedZones', 'route53:ListResourceRecordSets', 'route53:ListTagsForResource'],
        Resource: ['*'],
      },
    ],
  },
});

new aws.eks.PodIdentityAssociation('external-dns', {
  clusterName: cluster.name,
  namespace: 'kube-system',
  serviceAccount: 'external-dns',
  roleArn: role.arn,
});

new k8s.helm.v3.Chart('external-dns', {
  chart: 'external-dns',
  namespace: 'kube-system',
  fetchOpts: { repo: 'https://kubernetes-sigs.github.io/external-dns' },

  values: {
    provider: 'aws',
    policy: 'sync',

    interval: '5m',
    triggerLoopOnEvent: true,
    sources: ['ingress', 'service'],

    txtOwnerId: 'eks',
    txtPrefix: 'ed.',

    extraArgs: ['--aws-zones-cache-duration=1h'],
  },
});
