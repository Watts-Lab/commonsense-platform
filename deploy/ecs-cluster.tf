# ECS cluster with FARGATE / FARGATE_SPOT capacity providers.

resource "aws_ecs_cluster" "main" {
  name = "common-sense-cluster"

  configuration {
    execute_command_configuration {
      logging = "DEFAULT"
    }
  }

  service_connect_defaults {
    namespace = "arn:aws:servicediscovery:${var.aws_region}:${var.aws_account_id}:namespace/ns-tupgisoq4ewasbyu"
  }

  tags = {
    Project = "commonsense"
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]
}
