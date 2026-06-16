# ECS service (Fargate, behind the ALB).
#
# task_definition and desired_count are under ignore_changes because CI controls
# rollouts. Uses the two public subnets with a public IP.

resource "aws_ecs_service" "main" {
  name             = "common-sense-service"
  cluster          = aws_ecs_cluster.main.id
  task_definition  = aws_ecs_task_definition.main.arn
  desired_count    = 1
  platform_version = "1.4.0"

  enable_ecs_managed_tags = true

  tags = {
    Project = "commonsense"
  }

  # Live service uses a capacity provider strategy (NOT launch_type) — these are
  # mutually exclusive, and setting launch_type would force replacement.
  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
    base              = 0
  }

  deployment_controller {
    type = "ECS"
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100

  network_configuration {
    subnets          = local.public_subnet_ids
    assign_public_ip = true
    # Single clean managed SG. The default and penn-managed SGs were
    # intentionally unassigned (kept existing in the account, just not used here).
    security_groups = [
      aws_security_group.ecs.id,
    ]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.main.arn
    container_name   = "common-sense-ecr-repo"
    container_port   = 80
  }

  lifecycle {
    # CI/ops own which revision is deployed and how many tasks run.
    ignore_changes = [task_definition, desired_count]
  }
}
