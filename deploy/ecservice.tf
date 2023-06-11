resource "aws_ecs_service" "common_sense_service" {
  name            = "common-sense-service"                        # Naming our first service
  cluster         = aws_ecs_cluster.common_sense_cluster.id       # Referencing our created Cluster
  task_definition = aws_ecs_task_definition.common_sense_task.arn # Referencing our created Task Definition
  launch_type     = "FARGATE"
  desired_count   = 1

  load_balancer {
    target_group_arn = aws_lb_target_group.target_group.arn # Referencing our target group
    container_name   = aws_ecs_task_definition.common_sense_task.family
    container_port   = 80 # Specifying the container port
  }

  # TODO: add proper subnets
  network_configuration {
    subnets          = ["${aws_subnet.default_subnet_a.id}", "${aws_subnet.default_subnet_b.id}", "${aws_subnet.default_subnet_c.id}"]
    assign_public_ip = true # Providing our containers with public IPs
  }

}

resource "aws_security_group" "service_security_group" {
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    # Only allowing traffic in from the load balancer security group
    security_groups = ["${aws_security_group.load_balancer_security_group.id}"]
  }

  egress {
    from_port   = 0 # Allowing any incoming port
    to_port     = 0 # Allowing any outgoing port
    protocol    = "-1" # Allowing any outgoing protocol 
    cidr_blocks = ["0.0.0.0/0"] # Allowing traffic out to all IP addresses
  }
}
