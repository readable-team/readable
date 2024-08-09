import * as aws from '@pulumi/aws';
import * as cloudflare from '@pulumi/cloudflare';
import * as random from '@pulumi/random';
import { securityGroups, subnets } from '$aws/vpc';
import { zones } from '$cloudflare/zone';

const devPassword = new random.RandomPassword('readable-dev@rds', {
  length: 20,
  special: false,
});

const subnetGroup = new aws.rds.SubnetGroup('private', {
  name: 'private',
  description: 'Private subnets',
  subnetIds: [subnets.private.az1.id, subnets.private.az2.id],
});

const devCluster = new aws.rds.Cluster('readable-dev', {
  clusterIdentifier: 'readable-dev',

  engine: 'aurora-postgresql',
  engineMode: 'provisioned',
  engineVersion: '16.2',

  dbSubnetGroupName: subnetGroup.name,
  vpcSecurityGroupIds: [securityGroups.internal.id],

  deletionProtection: true,
  storageEncrypted: true,

  backupRetentionPeriod: 7,
  finalSnapshotIdentifier: 'readable-dev-final-snapshot',

  preferredBackupWindow: '19:00-20:00',
  preferredMaintenanceWindow: 'sun:20:00-sun:22:00',

  masterUsername: 'root',
  masterPassword: devPassword.result,

  applyImmediately: true,
});

new aws.rds.ClusterInstance('readable-dev-1', {
  clusterIdentifier: devCluster.id,
  identifier: 'readable-dev-1',

  engine: 'aurora-postgresql',
  instanceClass: 'db.t4g.medium',

  availabilityZone: subnets.private.az1.availabilityZone,
  caCertIdentifier: 'rds-ca-ecc384-g1',

  preferredMaintenanceWindow: 'sun:20:00-sun:22:00',

  monitoringInterval: 0,
  performanceInsightsEnabled: false,

  promotionTier: 0,

  applyImmediately: true,
});

new cloudflare.Record('dev.db.rdbl.app', {
  zoneId: zones.rdbl_app.id,
  type: 'CNAME',
  name: 'dev.db.rdbl.app',
  value: devCluster.endpoint,
  comment: 'Amazon RDS',
});

export const outputs = {
  AWS_RDS_DEV_PASSWORD: devPassword.result,
};
