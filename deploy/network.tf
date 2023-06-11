resource "aws_ecs_cluster" "common_sense_cluster" {
  name = "common-sense-cluster"
}


# Providing a reference to our default VPC
resource "aws_vpc" "project_vpc" {
  cidr_block           = "10.128.164.0/25"
  enable_dns_hostnames = true
}

# Providing a reference to our default subnets
resource "aws_subnet" "default_subnet_a" {
  vpc_id            = aws_vpc.project_vpc.id
  cidr_block        = "10.128.164.0/27"
  availability_zone = "us-east-1a"
}

resource "aws_subnet" "default_subnet_b" {
  cidr_block        = "10.128.164.64/27"
  vpc_id            = aws_vpc.project_vpc.id
  availability_zone = "us-east-1a"
}

resource "aws_subnet" "default_subnet_c" {
  vpc_id            = aws_vpc.project_vpc.id
  cidr_block        = "10.128.164.96/27"
  availability_zone = "us-east-1b"
}

resource "aws_subnet" "default_subnet_d" {
  vpc_id            = aws_vpc.project_vpc.id
  cidr_block        = "10.128.164.32/27"
  availability_zone = "us-east-1b"
}
