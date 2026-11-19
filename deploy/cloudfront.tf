# CloudFront in front of the ALB adds CloudFront-Viewer-Country, which the app uses when tc is absent.
# The origin is the ALB hostname; the ALB certificate matches the forwarded viewer Host, so no origin certificate is needed.

locals {
  cloudfront_aliases = ["commonsensicality.org", "commonsensicality.com"]
}

resource "aws_cloudfront_origin_request_policy" "viewer_country" {
  name    = "commonsense-viewer-country"
  comment = "Forward viewer headers (including Host) plus CloudFront's viewer country to the ALB."

  cookies_config {
    cookie_behavior = "all"
  }

  headers_config {
    header_behavior = "allViewerAndWhitelistCloudFront"

    headers {
      items = ["CloudFront-Viewer-Country"]
    }
  }

  query_strings_config {
    query_string_behavior = "all"
  }
}

resource "aws_cloudfront_cache_policy" "no_cache" {
  name        = "commonsense-no-cache"
  comment     = "Survey responses are dynamic; never cache."
  min_ttl     = 0
  default_ttl = 0
  max_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

resource "aws_cloudfront_distribution" "main" {
  enabled         = true
  is_ipv6_enabled = false
  aliases         = local.cloudfront_aliases
  price_class     = "PriceClass_100"
  comment         = "commonsense"

  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "commonsense-alb"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id         = "commonsense-alb"
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods           = ["GET", "HEAD"]
    compress                 = true
    cache_policy_id          = aws_cloudfront_cache_policy.no_cache.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.viewer_country.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Must be a us-east-1 certificate that covers every alias above.
  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Project = "commonsense"
  }
}

output "cloudfront_domain_name" {
  description = "CloudFront hostname; test with curl --connect-to before switching DNS."
  value       = aws_cloudfront_distribution.main.domain_name
}
