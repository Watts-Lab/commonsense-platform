# S3 bucket holding the ECS task's environment file (server.env).
#
# We manage the bucket and its settings, but not the server.env object — it holds
# secrets, which would end up in Terraform state. Upload it out-of-band.

resource "aws_s3_bucket" "env" {
  bucket = "commonsenseplatform"

  tags = {
    Project = "commonsense"
  }
}

resource "aws_s3_bucket_versioning" "env" {
  bucket = aws_s3_bucket.env.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "env" {
  bucket = aws_s3_bucket.env.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "env" {
  bucket = aws_s3_bucket.env.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "env" {
  bucket = aws_s3_bucket.env.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}
