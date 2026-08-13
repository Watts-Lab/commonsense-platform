# Route 53 — hosted zones for the two domains (registered via Route 53).
#
# NS and SOA records are created automatically by AWS with the zone and are not
# managed here. We manage the records we actually created: the ALB aliases, the
# ACM validation CNAMEs, and the SES DKIM CNAMEs.
#
# Domain registration itself (auto-renew, contacts) is managed in the Route 53
# Domains console, not by Terraform.

# ── commonsensicality.org ─────────────────────────────────────────────────────
resource "aws_route53_zone" "org" {
  name    = "commonsensicality.org"
  comment = "HostedZone created by Route53 Registrar"

  tags = {
    Project = "commonsense"
  }
}

resource "aws_route53_record" "org_apex" {
  zone_id = aws_route53_zone.org.zone_id
  name    = "commonsensicality.org"
  type    = "A"

  alias {
    name                   = "dualstack.${aws_lb.main.dns_name}"
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "org_acm_validation" {
  zone_id = aws_route53_zone.org.zone_id
  name    = "_2158feb748608f79a88f3ef5d6c4ff75.commonsensicality.org"
  type    = "CNAME"
  ttl     = 300
  records = ["_1fbd327db649c3dce914c56bbac667fd.lrqzvpkdnn.acm-validations.aws."]
}

resource "aws_route53_record" "org_dkim" {
  for_each = toset([
    "l7wtsaa4eijjlnfjcvjuhz6qzax5djzl",
    "nvhs3hri6gsvii2ueuhgvo2rjzecx7ou",
    "w3izx7redv7j3pjeaiznlvg5qqglptp6",
  ])

  zone_id = aws_route53_zone.org.zone_id
  name    = "${each.value}._domainkey.commonsensicality.org"
  type    = "CNAME"
  ttl     = 1800
  records = ["${each.value}.dkim.amazonses.com"]
}

# ── commonsensicality.com ─────────────────────────────────────────────────────
resource "aws_route53_zone" "com" {
  name    = "commonsensicality.com"
  comment = "HostedZone created by Route53 Registrar"

  tags = {
    Project = "commonsense"
  }
}

resource "aws_route53_record" "com_apex" {
  zone_id = aws_route53_zone.com.zone_id
  name    = "commonsensicality.com"
  type    = "A"

  alias {
    name                   = "dualstack.${aws_lb.main.dns_name}"
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "com_acm_validation" {
  zone_id = aws_route53_zone.com.zone_id
  name    = "_bf12dfc229e4594583273c608fc04529.commonsensicality.com"
  type    = "CNAME"
  ttl     = 300
  records = ["_a95c4011b27cc4b44bc79de082e1a7d0.lrqzvpkdnn.acm-validations.aws."]
}
