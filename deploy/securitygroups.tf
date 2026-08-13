# Security groups, tiered so each only accepts traffic from the one in front:
#
#   internet ──80/443──> alb ──80──> ecs ──3306──> rds <──3306── bastion
#   internet ──22──> bastion

# ALB
resource "aws_security_group" "alb" {
  name        = "commonsense-alb"
  description = "ALB: public HTTP/HTTPS ingress"
  vpc_id      = data.aws_vpc.main.id

  tags = { Name = "commonsense-alb", Project = "commonsense" }
}

resource "aws_vpc_security_group_ingress_rule" "alb_http" {
  security_group_id = aws_security_group.alb.id
  description       = "HTTP from internet"
  ip_protocol       = "tcp"
  from_port         = 80
  to_port           = 80
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_ingress_rule" "alb_https" {
  security_group_id = aws_security_group.alb.id
  description       = "HTTPS from internet"
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "alb_all" {
  security_group_id = aws_security_group.alb.id
  description       = "All egress"
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

# ECS
resource "aws_security_group" "ecs" {
  name        = "commonsense-ecs"
  description = "ECS tasks: app traffic from ALB, egress to RDS"
  vpc_id      = data.aws_vpc.main.id

  tags = { Name = "commonsense-ecs", Project = "commonsense" }
}

resource "aws_vpc_security_group_ingress_rule" "ecs_from_alb" {
  security_group_id            = aws_security_group.ecs.id
  description                  = "App port from ALB"
  ip_protocol                  = "tcp"
  from_port                    = 80
  to_port                      = 80
  referenced_security_group_id = aws_security_group.alb.id
}

resource "aws_vpc_security_group_egress_rule" "ecs_all" {
  security_group_id = aws_security_group.ecs.id
  description       = "All egress (incl. RDS, ECR, S3, internet)"
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

# Bastion
resource "aws_security_group" "bastion" {
  name        = "commonsense-bastion"
  description = "EC2 bastion: SSH in, MySQL out to RDS"
  vpc_id      = data.aws_vpc.main.id

  tags = { Name = "commonsense-bastion", Project = "commonsense" }
}

resource "aws_vpc_security_group_ingress_rule" "bastion_ssh" {
  security_group_id = aws_security_group.bastion.id
  description       = "SSH (dynamic user IP; kept broad intentionally)"
  ip_protocol       = "tcp"
  from_port         = 22
  to_port           = 22
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "bastion_all" {
  security_group_id = aws_security_group.bastion.id
  description       = "All egress (incl. MySQL to RDS)"
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

# RDS
resource "aws_security_group" "rds" {
  name        = "commonsense-rds"
  description = "RDS: MySQL from ECS and bastion only"
  vpc_id      = data.aws_vpc.main.id

  tags = { Name = "commonsense-rds", Project = "commonsense" }
}

resource "aws_vpc_security_group_ingress_rule" "rds_from_ecs" {
  security_group_id            = aws_security_group.rds.id
  description                  = "MySQL from ECS tasks"
  ip_protocol                  = "tcp"
  from_port                    = 3306
  to_port                      = 3306
  referenced_security_group_id = aws_security_group.ecs.id
}

resource "aws_vpc_security_group_ingress_rule" "rds_from_bastion" {
  security_group_id            = aws_security_group.rds.id
  description                  = "MySQL from bastion"
  ip_protocol                  = "tcp"
  from_port                    = 3306
  to_port                      = 3306
  referenced_security_group_id = aws_security_group.bastion.id
}
