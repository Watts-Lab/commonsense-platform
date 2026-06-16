# Read-only references to infrastructure managed by UPenn ISC (VPC + subnets).
# Looked up by ID; Terraform never modifies them.

data "aws_vpc" "main" {
  id = var.vpc_id
}

data "aws_subnet" "public_a" {
  id = var.public_subnet_ids[0]
}

data "aws_subnet" "public_b" {
  id = var.public_subnet_ids[1]
}

locals {
  public_subnet_ids = [
    data.aws_subnet.public_a.id,
    data.aws_subnet.public_b.id,
  ]
}
