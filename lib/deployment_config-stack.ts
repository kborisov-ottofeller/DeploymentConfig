import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_lambda as lambda, aws_codedeploy, aws_cloudwatch } from 'aws-cdk-lib';

export class DeploymentConfigStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambda1 = new lambda.Function(this, 'Lambda1', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'lambda1.handler'
    });

    const lambda2 = new lambda.Function(this, 'Lambda2', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'lambda2.handler'
    });

    // Sequential deployment
    // lambda2.node.addDependency(lambda1);

    this.configureDeployment({
      lambda: lambda1,
      deploymentConfig: aws_codedeploy.LambdaDeploymentConfig.ALL_AT_ONCE,
      deploymentAlarmErrorsThreshold: 1,
    });

    this.configureDeployment({
      lambda: lambda2,
      deploymentConfig: aws_codedeploy.LambdaDeploymentConfig.ALL_AT_ONCE,//LINEAR_10PERCENT_EVERY_1MINUTE,
      deploymentAlarmErrorsThreshold: 1,
    });
  }

  configureDeployment(params: {
    lambda: lambda.Function,
    deploymentConfig?: aws_codedeploy.ILambdaDeploymentConfig,
    deploymentGroupName?: string,
    deploymentAlarmErrorsThreshold?: number
  }): lambda.QualifiedFunctionBase {
    const newVersion = params.lambda.currentVersion;
    newVersion.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);
    const alias = new lambda.Alias(params.lambda, 'CanaryAlias', {
      aliasName: 'live',
      version: newVersion
    });

    new aws_codedeploy.LambdaDeploymentGroup(params.lambda, 'LambdaDeploymentGroup', {
      alias,
      deploymentConfig: params.deploymentConfig,
      ...(params.deploymentGroupName ? { deploymentGroupName: params.deploymentGroupName } : {}),

      alarms: [
        new aws_cloudwatch.Alarm(params.lambda, 'DeploymentAlarm', {
          metric: alias.metricErrors({ period: cdk.Duration.minutes(1) }),
          threshold: params.deploymentAlarmErrorsThreshold || 10,
          alarmDescription: `${params.lambda.functionName} ${newVersion.version} canary deployment failure alarm`,
          evaluationPeriods: 1,
        }),
      ],
    });

    return alias;
  }
}
