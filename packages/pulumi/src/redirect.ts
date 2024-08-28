import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import { match } from 'ts-pattern';

type RedirectTarget = {
  host: pulumi.Input<string>;
  path?: pulumi.Input<string>;
};

type RedirectConfig = {
  from: RedirectTarget;
  to: RedirectTarget;
};

type RedirectArgs = {
  name: pulumi.Input<string>;

  priority: {
    production: pulumi.Input<string>;
    dev: pulumi.Input<string>;
  };

  code: pulumi.Input<301 | 302>;

  production: RedirectConfig;
  dev: RedirectConfig;
};

export class Redirect extends pulumi.ComponentResource {
  constructor(name: string, args: RedirectArgs, opts?: pulumi.ComponentResourceOptions) {
    super('readable:index:Redirect', name, {}, opts);

    const stack = pulumi.getStack();

    const namespace = match(stack)
      .with('prod', () => 'prod')
      .with('dev', () => 'dev')
      .run();

    const config = match(stack)
      .with('prod', () => args.production)
      .with('dev', () => args.dev)
      .run();

    const priority = match(stack)
      .with('prod', () => args.priority.production)
      .with('dev', () => args.priority.dev)
      .run();

    new k8s.networking.v1.Ingress(
      name,
      {
        metadata: {
          name: args.name,
          namespace,
          annotations: {
            'alb.ingress.kubernetes.io/group.name': 'public-alb',
            'alb.ingress.kubernetes.io/group.order': priority,
            'alb.ingress.kubernetes.io/listen-ports': JSON.stringify([{ HTTPS: 443 }]),
            'pulumi.com/skipAwait': 'true',

            'alb.ingress.kubernetes.io/actions.redirect': pulumi.jsonStringify({
              type: 'redirect',
              redirectConfig: {
                host: config.to.host,
                path: config.to.path,
                statusCode: pulumi.interpolate`HTTP_${args.code}`,
              },
            }),
          },
        },
        spec: {
          ingressClassName: 'alb',
          rules: [
            {
              host: config.from.host,
              http: {
                paths: [
                  {
                    path: config.from.path ?? '/*',
                    pathType: 'ImplementationSpecific',
                    backend: {
                      service: {
                        name: 'redirect',
                        port: { name: 'use-annotation' },
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      { parent: this },
    );
  }
}
