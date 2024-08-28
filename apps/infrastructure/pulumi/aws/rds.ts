import * as aws from '@pulumi/aws';
import * as random from '@pulumi/random';
import { zones } from '$aws/route53';
import { securityGroups, subnets } from '$aws/vpc';

const monitoring = new aws.iam.Role('monitoring@rds', {
  name: 'monitoring@rds',
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: 'monitoring.rds.amazonaws.com',
  }),
  managedPolicyArns: [aws.iam.ManagedPolicy.AmazonRDSEnhancedMonitoringRole],
});

const password = new random.RandomPassword('readable@rds', {
  length: 20,
  special: false,
});

const devPassword = new random.RandomPassword('readable-dev@rds', {
  length: 20,
  special: false,
});

const subnetGroup = new aws.rds.SubnetGroup('private', {
  name: 'private',
  description: 'Private subnets',
  subnetIds: [subnets.private.az1.id, subnets.private.az2.id],
});

const parameterGroup = new aws.rds.ClusterParameterGroup('readable', {
  name: 'readable-aurora-postgresql16',
  family: 'aurora-postgresql16',

  parameters: [
    { name: 'pg_stat_statements.track', value: 'ALL' },
    { name: 'pg_stat_statements.max', value: '10000', applyMethod: 'pending-reboot' },
    { name: 'pg_stat_statements.track_utility', value: '0' },
  ],
});

const cluster = new aws.rds.Cluster('readable', {
  clusterIdentifier: 'readable',

  engine: 'aurora-postgresql',
  engineMode: 'provisioned',
  engineVersion: '16.3',

  dbClusterParameterGroupName: parameterGroup.name,

  dbSubnetGroupName: subnetGroup.name,
  vpcSecurityGroupIds: [securityGroups.internal.id],

  deletionProtection: true,
  storageEncrypted: true,

  backupRetentionPeriod: 7,
  finalSnapshotIdentifier: 'readable-final-snapshot',

  preferredBackupWindow: '19:00-20:00',
  preferredMaintenanceWindow: 'sun:20:00-sun:22:00',

  masterUsername: 'root',
  masterPassword: password.result,

  applyImmediately: true,
});

const instance = new aws.rds.ClusterInstance('readable-1', {
  clusterIdentifier: cluster.id,
  identifier: 'readable-1',

  engine: 'aurora-postgresql',
  instanceClass: 'db.t4g.medium',

  availabilityZone: subnets.private.az1.availabilityZone,
  caCertIdentifier: 'rds-ca-ecc384-g1',

  preferredMaintenanceWindow: 'sun:20:00-sun:22:00',

  monitoringRoleArn: monitoring.arn,
  monitoringInterval: 60,
  performanceInsightsEnabled: true,

  promotionTier: 0,

  applyImmediately: true,
});

const devCluster = new aws.rds.Cluster('readable-dev', {
  clusterIdentifier: 'readable-dev',

  engine: 'aurora-postgresql',
  engineMode: 'provisioned',
  engineVersion: '16.3',

  dbClusterParameterGroupName: parameterGroup.name,

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

new aws.route53.Record('db.rdbl.app', {
  zoneId: zones.rdbl_app.zoneId,
  type: 'CNAME',
  name: 'db.rdbl.app',
  records: [cluster.endpoint],
  ttl: 300,
});

new aws.route53.Record('dev.db.rdbl.app', {
  zoneId: zones.rdbl_app.zoneId,
  type: 'CNAME',
  name: 'dev.db.rdbl.app',
  records: [devCluster.endpoint],
  ttl: 300,
});

export const db = {
  cluster,
  instance,
};

export const outputs = {
  AWS_RDS_PASSWORD: password.result,
  AWS_RDS_DEV_PASSWORD: devPassword.result,
};
