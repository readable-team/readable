import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { zones } from '$aws/route53';

const createCertificate = (zoneId: pulumi.Input<string>, domain: string) => {
  const certificate = new aws.acm.Certificate(domain, {
    domainName: domain,
    subjectAlternativeNames: [`*.${domain}`],
    validationMethod: 'DNS',
  });

  certificate.domainValidationOptions.apply((options) => {
    for (const option of options) {
      if (option.domainName !== domain) {
        continue;
      }

      const name = option.resourceRecordName.slice(0, -1);

      new aws.route53.Record(name, {
        zoneId,
        type: option.resourceRecordType,
        name,
        records: [option.resourceRecordValue.slice(0, -1)],
        ttl: 300,
      });
    }
  });

  new aws.acm.CertificateValidation(domain, {
    certificateArn: certificate.arn,
  });

  return certificate;
};

export const certificates = {
  rdbl_io: createCertificate(zones.rdbl_io.zoneId, 'rdbl.io'),
  rdbl_app: createCertificate(zones.rdbl_app.zoneId, 'rdbl.app'),
  rdbl_ninja: createCertificate(zones.rdbl_ninja.zoneId, 'rdbl.ninja'),
};

export const outputs = {
  AWS_ACM_RDBL_IO_CERTIFICATE_ARN: certificates.rdbl_io.arn,
  AWS_ACM_RDBL_APP_CERTIFICATE_ARN: certificates.rdbl_app.arn,
  AWS_ACM_RDBL_NINJA_CERTIFICATE_ARN: certificates.rdbl_ninja.arn,
};
