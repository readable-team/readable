import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { usEast1 } from '$aws/providers';
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

const createCloudfrontCertificate = (domain: string) => {
  const certificate = new aws.acm.Certificate(
    `${domain}@cloudfront`,
    {
      domainName: domain,
      subjectAlternativeNames: [`*.${domain}`],
      validationMethod: 'DNS',
    },
    { provider: usEast1 },
  );

  new aws.acm.CertificateValidation(`${domain}@cloudfront`, { certificateArn: certificate.arn }, { provider: usEast1 });

  return certificate;
};

export const certificates = {
  rdbl_io: createCertificate(zones.rdbl_io.zoneId, 'rdbl.io'),
  rdbl_app: createCertificate(zones.rdbl_app.zoneId, 'rdbl.app'),
  rdbl_ninja: createCertificate(zones.rdbl_ninja.zoneId, 'rdbl.ninja'),
};

export const cloudfrontCertificates = {
  rdbl_io: createCloudfrontCertificate('rdbl.io'),
  rdbl_app: createCloudfrontCertificate('rdbl.app'),
  rdbl_ninja: createCloudfrontCertificate('rdbl.ninja'),
};

export const outputs = {
  AWS_ACM_CLOUDFRONT_RDBL_IO_CERTIFICATE_ARN: cloudfrontCertificates.rdbl_io.arn,
};
