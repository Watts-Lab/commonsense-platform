terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # State is local; move to a remote backend (S3 + lock) before sharing.
}

provider "aws" {
  region = var.aws_region

  # Refuse to run against the wrong account.
  allowed_account_ids = [var.aws_account_id]
}
