# External inputs and account-specific identifiers. Real values live in
# terraform.tfvars (git-ignored); see terraform.tfvars.example for the shape.

variable "aws_account_id" {
  description = "AWS account ID (used for the provider guard and ARNs)."
  type        = string
}

variable "aws_region" {
  description = "AWS region."
  type        = string
  default     = "us-east-1"
}

variable "vpc_id" {
  description = "Penn-managed VPC ID."
  type        = string
}

variable "public_subnet_ids" {
  description = "The two public subnet IDs used by the ALB and ECS service."
  type        = list(string)
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN for the HTTPS listener."
  type        = string
}

variable "rds_kms_key_id" {
  description = "KMS key ARN for RDS storage encryption."
  type        = string
}

variable "bastion_ami" {
  description = "AMI ID for the bastion instance."
  type        = string
}

variable "bastion_private_ip" {
  description = "Static private IP for the bastion in its subnet."
  type        = string
}

variable "bastion_key_name" {
  description = "EC2 key pair name for the bastion."
  type        = string
}
