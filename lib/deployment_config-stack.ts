import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class DeploymentConfigStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambda1 = new cdk.aws_lambda.Function(this, 'Lambda1', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      code: cdk.aws_lambda.Code.fromAsset('lambda'),
      handler: 'lambda1.handler'
    });

    const lambda2 = new cdk.aws_lambda.Function(this, 'Lambda2', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      code: cdk.aws_lambda.Code.fromAsset('lambda'),
      handler: 'lambda2.handler'
    });
  }
}
