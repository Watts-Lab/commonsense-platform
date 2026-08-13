# SES — transactional email (server sends via @aws-sdk/client-sesv2).
# Domain commonsensicality.org uses Easy DKIM (CNAMEs in the domain's DNS);
# the gmail address is a verified fallback sender.

resource "aws_sesv2_email_identity" "domain" {
  email_identity = "commonsensicality.org"

  dkim_signing_attributes {
    next_signing_key_length = "RSA_2048_BIT"
  }

  tags = {
    Project = "commonsense"
  }
}

resource "aws_sesv2_email_identity" "fallback_email" {
  email_identity = "nakhaeiamirhossein@gmail.com"

  tags = {
    Project = "commonsense"
  }
}
