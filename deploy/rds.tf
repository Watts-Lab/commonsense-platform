# RDS — MariaDB primary database (database-common-sense).
#
# prevent_destroy is set so Terraform won't delete it. password is under
# ignore_changes (not readable on import; managed out-of-band).

data "aws_db_subnet_group" "default" {
  name = "default-${var.vpc_id}"
}

resource "aws_db_instance" "main" {
  identifier     = "database-common-sense"
  engine         = "mariadb"
  engine_version = "10.6.24"
  instance_class = "db.t3.medium"

  allocated_storage     = 20
  max_allocated_storage = 50
  storage_type          = "gp2"
  storage_encrypted     = true
  kms_key_id            = var.rds_kms_key_id

  username = "root"
  port     = 3306

  # Multi-AZ disabled to cut cost (~halves the instance bill). Trade-off: no
  # automatic cross-AZ failover; recovery from an AZ outage is restore-from-
  # backup instead. Acceptable for this workload. Reversible.
  multi_az            = false
  publicly_accessible = false

  db_subnet_group_name   = data.aws_db_subnet_group.default.name
  parameter_group_name   = "default.mariadb10.6"
  # Single clean managed SG (trusts commonsense-ecs + commonsense-bastion).
  vpc_security_group_ids = [
    aws_security_group.rds.id,
  ]

  backup_retention_period      = 7
  backup_window                = "07:33-08:03"
  maintenance_window           = "sat:05:24-sat:05:54"
  auto_minor_version_upgrade   = true
  ca_cert_identifier           = "rds-ca-rsa2048-g1"
  performance_insights_enabled = true
  copy_tags_to_snapshot        = true

  # Matches current live settings. Both are worth revisiting for safety:
  # enabling deletion_protection and taking a final snapshot on delete.
  deletion_protection = false
  skip_final_snapshot = true

  tags = {
    Project = "commonsense"
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes = [
      password, # master password is not readable; managed out-of-band
    ]
  }
}
