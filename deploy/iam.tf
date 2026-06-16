# ECS task execution role (used as both execution and task role).
# Managed policy: ECR pull + CloudWatch logs. Inline "accessbucket": read
# server.env from S3.

resource "aws_iam_role" "ecs_task_execution" {
  name = "ecsTaskExecutionRole"
  path = "/"

  # Note: the live role uses the older 2008-10-17 policy version. Kept verbatim
  # so the import produces a clean plan.
  assume_role_policy = jsonencode({
    Version = "2008-10-17"
    Statement = [
      {
        Sid       = ""
        Effect    = "Allow"
        Principal = { Service = "ecs-tasks.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })

  max_session_duration = 3600
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_managed" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "access_bucket" {
  name = "accessbucket"
  role = aws_iam_role.ecs_task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject"]
        Resource = ["arn:aws:s3:::commonsenseplatform/server.env"]
      },
      {
        Effect   = "Allow"
        Action   = ["s3:GetBucketLocation"]
        Resource = ["arn:aws:s3:::commonsenseplatform"]
      }
    ]
  })
}
