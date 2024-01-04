#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DeploymentConfigStack } from '../lib/deployment_config-stack';

const app = new cdk.App();
new DeploymentConfigStack(app, 'blog-canary-lambda-stack', {
});