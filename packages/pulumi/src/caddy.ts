import * as aws from '@pulumi/aws';
import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import { match } from 'ts-pattern';
import { DopplerSecret } from './doppler-secret';
import { IAMServiceAccount } from './iam-service-account';

type CaddyArgs = {
  name: pulumi.Input<string>;

  caddyfile: pulumi.Input<string>;

  domain: {
    production: pulumi.Input<string>;
    dev: pulumi.Input<string>;
  };

  resources: {
    cpu: pulumi.Input<string>;
    memory: pulumi.Input<string>;
  };

  autoscale?: {
    minCount?: pulumi.Input<number>;
    maxCount?: pulumi.Input<number>;
    averageCpuUtilization?: pulumi.Input<number>;
  };

  iam?: {
    policy: pulumi.Input<aws.iam.PolicyDocument>;
  };

  secret?: {
    project: pulumi.Input<string>;
  };
};

export class Caddy extends pulumi.ComponentResource {
  constructor(name: string, args: CaddyArgs, opts?: pulumi.ComponentResourceOptions) {
    super('readable:index:Caddy', name, {}, opts);

    const stack = pulumi.getStack();
    const isProd = stack === 'prod';

    const domainName = match(stack)
      .with('prod', () => args.domain.production)
      .with('dev', () => args.domain.dev)
      .run();

    const namespace = match(stack)
      .with('prod', () => 'prod')
      .with('dev', () => 'dev')
      .run();

    const config = match(stack)
      .with('prod', () => 'prod')
      .with('dev', () => 'dev')
      .run();

    let secret;
    if (args.secret) {
      secret = new DopplerSecret(
        name,
        {
          metadata: {
            name: args.name,
            namespace,
          },
          spec: {
            project: args.secret.project,
            config,
          },
        },
        { parent: this },
      );
    }

    let serviceAccount;
    if (args.iam) {
      serviceAccount = new IAMServiceAccount(
        name,
        {
          metadata: {
            name: args.name,
            namespace,
          },
          spec: {
            policy: args.iam.policy,
          },
        },
        { parent: this },
      );
    }

    const labels = { app: args.name };

    const cm = new k8s.core.v1.ConfigMap(
      name,
      {
        metadata: {
          name: args.name,
          namespace,
        },
        data: {
          Caddyfile: args.caddyfile,
        },
      },
      { parent: this },
    );

    const service = new k8s.core.v1.Service(
      name,
      {
        metadata: {
          name: args.name,
          namespace,
          annotations: {
            'service.beta.kubernetes.io/aws-load-balancer-name': args.name,
            'service.beta.kubernetes.io/aws-load-balancer-scheme': 'internet-facing',
            'service.beta.kubernetes.io/aws-load-balancer-security-groups': 'internal, public-web',
            'external-dns.alpha.kubernetes.io/hostname': domainName,
            'pulumi.com/skipAwait': 'true',
          },
        },
        spec: {
          type: 'LoadBalancer',
          loadBalancerClass: 'service.k8s.aws/nlb',
          selector: labels,
          ports: [
            { name: 'http', port: 80 },
            { name: 'https', port: 443 },
          ],
        },
      },
      { parent: this },
    );

    const rollout = new k8s.apiextensions.CustomResource(
      name,
      {
        apiVersion: 'argoproj.io/v1alpha1',
        kind: 'Rollout',

        metadata: {
          name: args.name,
          namespace,
          annotations: {
            'pulumi.com/patchForce': 'true',
            'reloader.stakater.com/auto': 'true',
            ...(isProd && {
              'notifications.argoproj.io/subscribe.on-rollout-completed.slack': 'activities',
            }),
          },
        },
        spec: {
          ...(!isProd && { replicas: 1 }),
          selector: { matchLabels: labels },
          template: {
            metadata: { labels },
            spec: {
              ...(serviceAccount && { serviceAccountName: serviceAccount.metadata.name }),
              containers: [
                {
                  name: 'caddy',
                  image: '637423633734.dkr.ecr.ap-northeast-2.amazonaws.com/caddy:latest',
                  ...(secret && { envFrom: [{ secretRef: { name: secret.metadata.name } }] }),
                  resources: {
                    requests: { cpu: args.resources.cpu },
                    limits: { memory: args.resources.memory },
                  },
                  readinessProbe: {
                    httpGet: { path: '/healthz', port: 80 },
                  },
                  volumeMounts: [{ name: 'cm', mountPath: '/etc/caddy' }],
                },
              ],
              volumes: [{ name: 'cm', configMap: { name: cm.metadata.name } }],
            },
          },
          strategy: {
            blueGreen: {
              activeService: service.metadata.name,
            },
          },
        },
      },
      {
        parent: this,
      },
    );

    if (isProd) {
      new k8s.autoscaling.v2.HorizontalPodAutoscaler(
        name,
        {
          metadata: {
            name: args.name,
            namespace,
          },
          spec: {
            scaleTargetRef: {
              apiVersion: rollout.apiVersion,
              kind: rollout.kind,
              name: rollout.metadata.name,
            },
            minReplicas: args.autoscale?.minCount ?? 2,
            maxReplicas: args.autoscale?.maxCount ?? 10,
            metrics: [
              {
                type: 'Resource',
                resource: {
                  name: 'cpu',
                  target: {
                    type: 'Utilization',
                    averageUtilization: args.autoscale?.averageCpuUtilization ?? 50,
                  },
                },
              },
            ],
          },
        },
        { parent: this },
      );

      new k8s.policy.v1.PodDisruptionBudget(
        name,
        {
          metadata: {
            name: args.name,
            namespace,
          },
          spec: {
            selector: { matchLabels: labels },
            minAvailable: '50%',
          },
        },
        { parent: this },
      );
    }
  }
}
