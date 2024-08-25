import * as aws from '@pulumi/aws';
import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';

type IAMServiceAccountArgs = {
  metadata: {
    name: pulumi.Input<string>;
    namespace: pulumi.Input<string>;
  };
  spec: {
    policy: pulumi.Input<aws.iam.PolicyDocument>;
  };
};

type IAMServiceAccountOutputMetadata = {
  name: string;
  namespace: string;
};

export class IAMServiceAccount extends pulumi.ComponentResource {
  public readonly metadata: pulumi.Output<IAMServiceAccountOutputMetadata>;

  constructor(name: string, args: IAMServiceAccountArgs, opts?: pulumi.ComponentResourceOptions) {
    super('readable:index:IAMServiceAccount', name, {}, opts);

    const role = new aws.iam.Role(
      `${name}@eks`,
      {
        name: pulumi.interpolate`${args.metadata.name}+${args.metadata.namespace}@eks`,
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
      },
      { parent: this },
    );

    new aws.iam.RolePolicy(
      `${name}@eks`,
      {
        role: role.name,
        policy: args.spec.policy,
      },
      { parent: this },
    );

    const serviceAccount = new k8s.core.v1.ServiceAccount(
      name,
      {
        metadata: {
          name: args.metadata.name,
          namespace: args.metadata.namespace,
        },
      },
      { parent: this },
    );

    new aws.eks.PodIdentityAssociation(name, {
      clusterName: 'readable',
      namespace: serviceAccount.metadata.namespace,
      serviceAccount: serviceAccount.metadata.name,
      roleArn: role.arn,
    });

    this.metadata = pulumi.output({
      name: serviceAccount.metadata.name,
      namespace: serviceAccount.metadata.namespace,
    });
  }
}
