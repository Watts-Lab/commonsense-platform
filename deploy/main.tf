terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "us-east-1"
}

resource "aws_ecr_repository" "common_sense_ecr_repo" {
  name = "common-sense-ecr-repo" 
}