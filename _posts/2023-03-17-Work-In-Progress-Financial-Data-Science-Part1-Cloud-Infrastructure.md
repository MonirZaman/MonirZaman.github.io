In this article, I will demonstrate how to use AWS Step Function. AWS Step Function is a service that lets you orchestrate multiple AWS services in a workflow. I will use it to analyze financial data with some simple code examples. The code examples are written in AWS CDK, which is a tool that helps you create cloud resources with your preferred programming language.

The code example creates these cloud resources: a VPC, a DynamoDB table inside the VPC, two Lambda functions that interact with the table inside the VPC, and a Step Function that runs the Lambda functions one after another. The first Lambda function adds data to the table, and the second Lambda function retrieves data from the table.

You can adapt this code example to your own scenario by changing the Lambda functions, the VPC, and the Step Function definition.

Here is the sample cdk code:

```typescript
from aws_cdk import (
    aws_stepfunctions as sfn,
    aws_stepfunctions_tasks as tasks,
    aws_lambda as _lambda,
    aws_dynamodb as dynamodb,
    aws_ec2 as ec2,
    core,
)

class StepFunctionStack(core.Stack):
    def __init__(self, scope: core.Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Create a VPC
        vpc = ec2.Vpc(
            self,
            "Vpc",
            max_azs=2,
            cidr="10.0.0.0/16",
            subnet_configuration=[
                ec2.SubnetConfiguration(
                    name="public", subnet_type=ec2.SubnetType.PUBLIC
                )
            ],
        )

        # Create a DynamoDB table in the VPC
        table = dynamodb.Table(
            self,
            "Table",
            partition_key=dynamodb.Attribute(
                name="id", type=dynamodb.AttributeType.STRING
            ),
            removal_policy=core.RemovalPolicy.DESTROY,
            vpc=vpc,
        )

        # Create a Lambda function to add an item to the table
        add_item_lambda = _lambda.Function(
            self,
            "AddItemLambda",
            runtime=_lambda.Runtime.PYTHON_3_8,
            handler="add_item.handler",
            code=_lambda.Code.from_asset("lambda"),
            environment={"TABLE_NAME": table.table_name},
            vpc=vpc,
            security_groups=[vpc.default_security_group],
            allow_all_outbound=True,
        )

        # Create a Lambda function to query an item from the table
        query_item_lambda = _lambda.Function(
            self,
            "QueryItemLambda",
            runtime=_lambda.Runtime.PYTHON_3_8,
            handler="query_item.handler",
            code=_lambda.Code.from_asset("lambda"),
            environment={"TABLE_NAME": table.table_name},
            vpc=vpc,
            security_groups=[vpc.default_security_group],
            allow_all_outbound=True,
        )

        # Create a Step Function
        add_item_task = tasks.LambdaInvoke(
            self, "AddItemTask", lambda_function=add_item_lambda
        )
        query_item_task = tasks.LambdaInvoke(
            self, "QueryItemTask", lambda_function=query_item_lambda
        )

        definition = add_item_task.next(query_item_task)

        sfn.StateMachine(
            self,
            "StateMachine",
            definition=definition,
            timeout=core.Duration.minutes(5),
        )
```
