# Container registries for the two images that run in the ECS task.
# Both are MUTABLE with scan-on-push disabled, matching the live config.

resource "aws_ecr_repository" "app" {
  name                 = "common-sense-ecr-repo"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = false
  }
}

resource "aws_ecr_repository" "report" {
  name                 = "commonsense-report"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = false
  }
}

# Lifecycle policies: keep only the 5 most recent images per repo, expire the
# rest. Both repos share the same rule.
locals {
  ecr_keep_last_5 = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "remove old images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 5
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name
  policy     = local.ecr_keep_last_5
}

resource "aws_ecr_lifecycle_policy" "report" {
  repository = aws_ecr_repository.report.name
  policy     = local.ecr_keep_last_5
}
