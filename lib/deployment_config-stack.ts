import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  aws_lambda as lambda,
  aws_codedeploy,
  aws_cloudwatch,
} from "aws-cdk-lib";

export class DeploymentConfigStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const myLambda = new lambda.Function(this, "Lambda", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("my-lambda"),
      handler: "my-lambda.handler",
    });

    this.configureDeployment({
      lambda: myLambda,
      deploymentConfig:
        aws_codedeploy.LambdaDeploymentConfig.LINEAR_10PERCENT_EVERY_1MINUTE,
    });
  }

  configureDeployment(params: {
    lambda: lambda.Function;
    deploymentConfig?: aws_codedeploy.ILambdaDeploymentConfig;
    deploymentGroupName?: string;
  }): lambda.QualifiedFunctionBase {
    const newVersion = params.lambda.currentVersion;

    const alias = new lambda.Alias(params.lambda, "CanaryAlias", {
      aliasName: "live",
      version: newVersion,
    });

    new aws_codedeploy.LambdaDeploymentGroup(
      params.lambda,
      "LambdaDeploymentGroup",
      {
        alias,
        deploymentConfig: params.deploymentConfig,

        alarms: [
          new aws_cloudwatch.Alarm(params.lambda, "DeploymentAlarm", {
            metric: alias.metricErrors({ period: cdk.Duration.minutes(1) }),
            threshold: 10,
            alarmDescription: `${params.lambda.functionName} ${newVersion.version} canary deployment failure alarm`,
            evaluationPeriods: 1,
          }),
        ],
      }
    );

    return alias;
  }
}
