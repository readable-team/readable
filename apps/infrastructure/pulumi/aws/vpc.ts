import * as aws from '@pulumi/aws';

const vpc = new aws.ec2.Vpc('readable', {
  cidrBlock: '10.10.0.0/16',
  enableDnsHostnames: true,
  tags: { Name: 'readable' },
});

const publicAz1Subnet = new aws.ec2.Subnet('public-az1', {
  vpcId: vpc.id,
  availabilityZone: 'ap-northeast-2a',
  cidrBlock: '10.10.100.0/22',
  mapPublicIpOnLaunch: true,
  tags: {
    'Name': 'public-az1',
    'kubernetes.io/role/elb': '1',
  },
});

const publicAz2Subnet = new aws.ec2.Subnet('public-az2', {
  vpcId: vpc.id,
  availabilityZone: 'ap-northeast-2b',
  cidrBlock: '10.10.104.0/22',
  mapPublicIpOnLaunch: true,
  tags: {
    'Name': 'public-az2',
    'kubernetes.io/role/elb': '1',
  },
});

const privateAz1Subnet = new aws.ec2.Subnet('private-az1', {
  vpcId: vpc.id,
  availabilityZone: 'ap-northeast-2a',
  cidrBlock: '10.10.200.0/22',
  tags: {
    'Name': 'private-az1',
    'kubernetes.io/role/internal-elb': '1',
  },
});

const privateAz2Subnet = new aws.ec2.Subnet('private-az2', {
  vpcId: vpc.id,
  availabilityZone: 'ap-northeast-2b',
  cidrBlock: '10.10.204.0/22',
  tags: {
    'Name': 'private-az2',
    'kubernetes.io/role/internal-elb': '1',
  },
});

const publicInternetGateway = new aws.ec2.InternetGateway('public', {
  vpcId: vpc.id,
  tags: { Name: 'public' },
});

const publicRouteTable = new aws.ec2.RouteTable('public', {
  vpcId: vpc.id,
  routes: [
    {
      cidrBlock: '0.0.0.0/0',
      gatewayId: publicInternetGateway.id,
    },
  ],
  tags: { Name: 'public' },
});

new aws.ec2.RouteTableAssociation('public-az1', {
  subnetId: publicAz1Subnet.id,
  routeTableId: publicRouteTable.id,
});

new aws.ec2.RouteTableAssociation('public-az2', {
  subnetId: publicAz2Subnet.id,
  routeTableId: publicRouteTable.id,
});

const privateAz1Eip = new aws.ec2.Eip('natgw-az1', {
  tags: { Name: 'natgw-az1' },
});

const privateAz1NatGateway = new aws.ec2.NatGateway('az1', {
  subnetId: publicAz1Subnet.id,
  allocationId: privateAz1Eip.id,
  tags: { Name: 'az1' },
});

const privateAz1RouteTable = new aws.ec2.RouteTable('private-az1', {
  vpcId: vpc.id,
  routes: [
    {
      cidrBlock: '0.0.0.0/0',
      natGatewayId: privateAz1NatGateway.id,
    },
  ],
  tags: { Name: 'private-az1' },
});

new aws.ec2.RouteTableAssociation('private-az1', {
  subnetId: privateAz1Subnet.id,
  routeTableId: privateAz1RouteTable.id,
});

const privateAz2Eip = new aws.ec2.Eip('natgw-az2', {
  tags: { Name: 'natgw-az2' },
});

const privateAz2NatGateway = new aws.ec2.NatGateway('az2', {
  subnetId: publicAz2Subnet.id,
  allocationId: privateAz2Eip.id,
  tags: { Name: 'az2' },
});

const privateAz2RouteTable = new aws.ec2.RouteTable('private-az2', {
  vpcId: vpc.id,
  routes: [
    {
      cidrBlock: '0.0.0.0/0',
      natGatewayId: privateAz2NatGateway.id,
    },
  ],
  tags: { Name: 'private-az2' },
});

new aws.ec2.RouteTableAssociation('private-az2', {
  subnetId: privateAz2Subnet.id,
  routeTableId: privateAz2RouteTable.id,
});

const tailnetSecurityGroup = new aws.ec2.SecurityGroup('tailnet', {
  name: 'tailnet',
  description: 'Connection from Tailscale VPN',
  vpcId: vpc.id,

  tags: { Name: 'tailnet' },
});

new aws.ec2.SecurityGroupRule('tailnet.ingress', {
  securityGroupId: tailnetSecurityGroup.id,
  type: 'ingress',
  protocol: '-1',
  fromPort: 0,
  toPort: 0,
  cidrBlocks: ['0.0.0.0/0'],
});

new aws.ec2.SecurityGroupRule('tailnet.egress', {
  securityGroupId: tailnetSecurityGroup.id,
  type: 'egress',
  protocol: '-1',
  fromPort: 0,
  toPort: 0,
  cidrBlocks: ['0.0.0.0/0'],
});

const internalSecurityGroup = new aws.ec2.SecurityGroup('internal', {
  name: 'internal',
  description: 'Connection between services',
  vpcId: vpc.id,

  tags: { Name: 'internal' },
});

new aws.ec2.SecurityGroupRule('internal.ingress[self]', {
  securityGroupId: internalSecurityGroup.id,
  type: 'ingress',
  protocol: '-1',
  fromPort: 0,
  toPort: 0,
  self: true,
});

new aws.ec2.SecurityGroupRule('internal.ingress[tailnet]', {
  securityGroupId: internalSecurityGroup.id,
  type: 'ingress',
  protocol: '-1',
  fromPort: 0,
  toPort: 0,
  sourceSecurityGroupId: tailnetSecurityGroup.id,
});

new aws.ec2.SecurityGroupRule('internal.egress', {
  securityGroupId: internalSecurityGroup.id,
  type: 'egress',
  protocol: '-1',
  fromPort: 0,
  toPort: 0,
  cidrBlocks: ['0.0.0.0/0'],
});

const publicWebSecurityGroup = new aws.ec2.SecurityGroup('public-web', {
  name: 'public-web',
  description: 'Security group for public websites',
  vpcId: vpc.id,

  tags: { Name: 'public-web' },
});

new aws.ec2.SecurityGroupRule('public-web.ingress[tcp:80]', {
  securityGroupId: publicWebSecurityGroup.id,
  type: 'ingress',
  protocol: 'tcp',
  fromPort: 80,
  toPort: 80,
  cidrBlocks: ['0.0.0.0/0'],
});

new aws.ec2.SecurityGroupRule('public-web.ingress[tcp:443]', {
  securityGroupId: publicWebSecurityGroup.id,
  type: 'ingress',
  protocol: 'tcp',
  fromPort: 443,
  toPort: 443,
  cidrBlocks: ['0.0.0.0/0'],
});

new aws.ec2.SecurityGroupRule('public-web.egress', {
  securityGroupId: publicWebSecurityGroup.id,
  type: 'egress',
  protocol: '-1',
  fromPort: 0,
  toPort: 0,
  cidrBlocks: ['0.0.0.0/0'],
});

export { vpc };

export const subnets = {
  public: { az1: publicAz1Subnet, az2: publicAz2Subnet },
  private: { az1: privateAz1Subnet, az2: privateAz2Subnet },
};

export const securityGroups = {
  tailnet: tailnetSecurityGroup,
  internal: internalSecurityGroup,
};
