This blog post will explain AWS Step function. I will show some basic code examples to create Step function. This is the infrastructure will used for 
analyzing financial data.  All the code example will be in AWS CDK which is a framework that allows you to define and provision cloud infrastructure in code and deploy it through AWS CloudFormation.

This code creates a VPC, a DynamoDB table in the VPC, two Lambda functions to add and query items from the table in the VPC, and a Step Function that invokes the Lambda functions in sequence. The add_item Lambda function adds an item to the table, and the query_item Lambda function queries an item from the table. The Step Function invokes the add_item function first, and then the query_item function.

You can customize this code to fit your specific use case by modifying the Lambda functions, the VPC, and the Step Function definition.

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
