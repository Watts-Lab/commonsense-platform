# Email alert when a task in the ECS service stops unexpectedly (crash, OOM,
# failed health check, deploy rollback, etc.). Normal deploy-driven stops
# (draining old tasks during a rolling update) are excluded via stoppedReason.

resource "aws_sns_topic" "ecs_alerts" {
  name = "common-sense-ecs-alerts"

  tags = {
    Project = "commonsense"
  }
}

resource "aws_sns_topic_subscription" "ecs_alerts_email" {
  topic_arn = aws_sns_topic.ecs_alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

resource "aws_sns_topic_policy" "ecs_alerts" {
  arn = aws_sns_topic.ecs_alerts.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowEventBridgePublish"
        Effect    = "Allow"
        Principal = { Service = "events.amazonaws.com" }
        Action    = "sns:Publish"
        Resource  = aws_sns_topic.ecs_alerts.arn
      }
    ]
  })
}

resource "aws_cloudwatch_event_rule" "ecs_task_stopped" {
  name        = "common-sense-ecs-task-stopped"
  description = "Fires when a task in common-sense-service stops for a reason other than a normal deployment."

  event_pattern = jsonencode({
    source      = ["aws.ecs"]
    detail-type = ["ECS Task State Change"]
    detail = {
      clusterArn = [aws_ecs_cluster.main.arn]
      lastStatus = ["STOPPED"]
      stoppedReason = [{
        "anything-but" = { prefix = "Scaling activity initiated by (deployment" }
      }]
    }
  })
}

resource "aws_cloudwatch_event_target" "ecs_task_stopped_to_sns" {
  rule = aws_cloudwatch_event_rule.ecs_task_stopped.name
  arn  = aws_sns_topic.ecs_alerts.arn
}
