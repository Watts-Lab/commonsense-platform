# ALB + target group + listeners.
#   :80  HTTP  → 301 redirect to HTTPS
#   :443 HTTPS → forward to target group (cert from ACM)

resource "aws_lb" "main" {
  name               = "common-sense-loadbalancer"
  load_balancer_type = "application"
  internal           = false

  subnets         = local.public_subnet_ids
  # Single clean managed SG (public 80/443).
  security_groups = [
    aws_security_group.alb.id,
  ]

  idle_timeout                     = 60
  enable_http2                     = true
  enable_cross_zone_load_balancing = true
  enable_deletion_protection       = false

  tags = {
    Project = "commonsense"
  }
}

resource "aws_lb_target_group" "main" {
  name        = "lb-target-cm"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = data.aws_vpc.main.id

  deregistration_delay = 300

  health_check {
    enabled             = true
    protocol            = "HTTP"
    port                = "traffic-port"
    path                = "/"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 5
    unhealthy_threshold = 2
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.acm_certificate_arn

  tags = {
    Project = "commonsense"
  }

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn

    forward {
      target_group {
        arn    = aws_lb_target_group.main.arn
        weight = 1
      }

      stickiness {
        enabled  = false
        duration = 3600
      }
    }
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  tags = {
    Project = "commonsense"
  }

  default_action {
    type = "redirect"

    redirect {
      protocol    = "HTTPS"
      port        = "443"
      host        = "#{host}"
      path        = "/#{path}"
      query       = "#{query}"
      status_code = "HTTP_301"
    }
  }
}
