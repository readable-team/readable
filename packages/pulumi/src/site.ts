import * as aws from '@pulumi/aws';
import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import { match } from 'ts-pattern';
import { DopplerSecret } from './doppler-secret';
import { IAMServiceAccount } from './iam-service-account';

type SiteArgs = {
  name: pulumi.Input<string>;

  domain: {
    production: pulumi.Input<string>;
    dev: pulumi.Input<string>;

    secondary?: {
      production: pulumi.Input<string>;
      dev: pulumi.Input<string>;
    };
  };

  image: {
    name: pulumi.Input<string>;
    digest: pulumi.Input<string>;
    command?: pulumi.Input<string[]>;
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

export class Site extends pulumi.ComponentResource {
  public readonly url: pulumi.Output<string>;

  constructor(name: string, args: SiteArgs, opts?: pulumi.ComponentResourceOptions) {
    super('readable:index:Site', name, {}, opts);

    const project = pulumi.getProject();
    const stack = pulumi.getStack();
    const isProd = stack === 'prod';

    const domainName = match(stack)
      .with('prod', () => args.domain.production)
      .with('dev', () => args.domain.dev)
      .run();

    const secondaryDomainName = match(stack)
      .with('prod', () => args.domain.secondary?.production)
      .with('dev', () => args.domain.secondary?.dev)
      .run();

    const namespace = match(stack)
      .with('prod', () => 'prod')
      .with('dev', () => 'dev')
      .run();

    const config = match(stack)
      .with('prod', () => 'prod')
      .with('dev', () => 'dev')
      .run();

    this.url = pulumi.output(pulumi.interpolate`https://${domainName}`);

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

    const service = new k8s.core.v1.Service(
      name,
      {
        metadata: {
          name: args.name,
          namespace,
          annotations: {
            'pulumi.com/skipAwait': 'true',
          },
        },
        spec: {
          type: 'NodePort',
          selector: labels,
          ports: [{ port: 3000 }],
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
                  name: 'app',
                  image: pulumi.interpolate`${args.image.name}@${args.image.digest}`,
                  command: args.image.command,
                  env: [
                    { name: 'HTTP_HOST', value: domainName },
                    { name: 'HTTP_XFF_HOP', value: isProd ? '2' : '1' },
                    { name: 'PUBLIC_PULUMI_PROJECT', value: project },
                    { name: 'PUBLIC_PULUMI_STACK', value: stack },
                  ],
                  ...(secret && { envFrom: [{ secretRef: { name: secret.metadata.name } }] }),
                  resources: {
                    requests: { cpu: args.resources.cpu },
                    limits: { memory: args.resources.memory },
                  },
                  readinessProbe: {
                    httpGet: { path: '/healthz', port: 3000 },
                  },
                },
              ],
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

    const hosts = [domainName, secondaryDomainName].filter(Boolean);

    new k8s.networking.v1.Ingress(
      name,
      {
        metadata: {
          name: args.name,
          namespace,
          annotations: {
            'alb.ingress.kubernetes.io/group.name': 'public-alb',
            'alb.ingress.kubernetes.io/listen-ports': JSON.stringify([{ HTTPS: 443 }]),
            'alb.ingress.kubernetes.io/healthcheck-path': '/healthz',
            'external-dns.alpha.kubernetes.io/cloudflare-proxied': 'true',
          },
        },
        spec: {
          ingressClassName: 'alb',
          rules: hosts.map((host) => ({
            host,
            http: {
              paths: [
                {
                  path: '/',
                  pathType: 'Prefix',
                  backend: {
                    service: {
                      name: service.metadata.name,
                      port: { number: service.spec.ports[0].port },
                    },
                  },
                },
              ],
            },
          })),
        },
      },
      { parent: this },
    );
  }
}
