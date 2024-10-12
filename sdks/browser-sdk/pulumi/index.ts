import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

new aws.s3.BucketObject('script.js', {
  bucket: 'readable-sdk',

  key: 'script.js',
  contentType: 'text/javascript;charset=utf-8',

  source: new pulumi.asset.FileAsset('../dist/script.js'),
});

new aws.s3.BucketObject('style.css', {
  bucket: 'readable-sdk',

  key: 'style.css',
  contentType: 'text/css;charset=utf-8',

  source: new pulumi.asset.FileAsset('../dist/style.css'),
});
