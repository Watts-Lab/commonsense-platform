# ECS task definition (family "common-sense-env").
#
# The GitHub Actions pipeline registers new revisions with fresh image tags on
# every push, so container_definitions is under ignore_changes to avoid fighting
# CI. Structural changes (cpu/memory, roles) go through Terraform.

resource "aws_ecs_task_definition" "main" {
  family                   = "common-sense-env"
  cpu                      = "1024"
  memory                   = "3072"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task_execution.arn

  runtime_platform {
    cpu_architecture        = "X86_64"
    operating_system_family = "LINUX"
  }

  container_definitions = jsonencode([
    {
      name      = "common-sense-ecr-repo"
      image     = "${aws_ecr_repository.app.repository_url}:9b0fd9f3e88d50d604a6214cc9a77bcc91cbefe2"
      cpu       = 0
      essential = true
      portMappings = [
        {
          name          = "common-sense-ecr-repo-80-tcp"
          containerPort = 80
          hostPort      = 80
          protocol      = "tcp"
          appProtocol   = "http"
        }
      ]
      environment = []
      environmentFiles = [
        {
          value = "arn:aws:s3:::commonsenseplatform/server.env"
          type  = "s3"
        }
      ]
      mountPoints    = []
      volumesFrom    = []
      systemControls = []
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/common-sense-env"
          "awslogs-create-group"  = "true"
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    },
    {
      name      = "commonsense-report"
      image     = "${aws_ecr_repository.report.repository_url}:latest"
      cpu       = 0
      memory    = 512
      essential = false
      portMappings = [
        {
          name          = "commonsense-report-8080-tcp"
          containerPort = 8080
          hostPort      = 8080
          protocol      = "tcp"
          appProtocol   = "http"
        }
      ]
      environment    = []
      mountPoints    = []
      volumesFrom    = []
      systemControls = []
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/common-sense-env"
          "awslogs-create-group"  = "true"
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  lifecycle {
    # CI owns image rollouts — don't treat per-deploy image tag changes as drift.
    ignore_changes = [container_definitions]
  }
}
