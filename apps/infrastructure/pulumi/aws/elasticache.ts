import * as aws from '@pulumi/aws';
import * as cloudflare from '@pulumi/cloudflare';
import { securityGroups, subnets } from '$aws/vpc';
import { zones } from '$cloudflare/zone';

const subnetGroup = new aws.elasticache.SubnetGroup('private', {
  name: 'private',
  subnetIds: [subnets.private.az1.id, subnets.private.az2.id],
});

const cluster = new aws.elasticache.ReplicationGroup('readable', {
  replicationGroupId: 'readable',
  description: 'Redis cluster',

  engine: 'redis',
  engineVersion: '7.1',

  nodeType: 'cache.t4g.micro',
  numCacheClusters: 1,

  subnetGroupName: subnetGroup.name,
  securityGroupIds: [securityGroups.internal.id],

  multiAzEnabled: false,
  automaticFailoverEnabled: false,

  atRestEncryptionEnabled: true,
  transitEncryptionEnabled: false,

  snapshotRetentionLimit: 7,
  finalSnapshotIdentifier: 'readable-final-snapshot',

  snapshotWindow: '19:00-20:00',
  maintenanceWindow: 'sun:20:00-sun:22:00',

  applyImmediately: true,
});

new cloudflare.Record('redis.rdbl.app', {
  zoneId: zones.rdbl_app.id,
  type: 'CNAME',
  name: 'redis.rdbl.app',
  value: cluster.primaryEndpointAddress,
  comment: 'Amazon ElastiCache',
});
