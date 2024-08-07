import * as aws from '@pulumi/aws';
import { securityGroups, subnets } from '$aws/vpc';

const eks = new aws.efs.FileSystem('eks', {
  throughputMode: 'elastic',
  encrypted: true,

  lifecyclePolicies: [
    {
      transitionToIa: 'AFTER_30_DAYS',
    },
    {
      transitionToArchive: 'AFTER_90_DAYS',
    },
  ],

  tags: {
    Name: 'eks',
  },
});

new aws.efs.BackupPolicy('eks', {
  fileSystemId: eks.id,

  backupPolicy: {
    status: 'ENABLED',
  },
});

new aws.efs.MountTarget('az1@eks', {
  fileSystemId: eks.id,
  subnetId: subnets.private.az1.id,
  securityGroups: [securityGroups.internal.id],
});

new aws.efs.MountTarget('az2@eks', {
  fileSystemId: eks.id,
  subnetId: subnets.private.az2.id,
  securityGroups: [securityGroups.internal.id],
});

export const filesystems = {
  eks,
};
