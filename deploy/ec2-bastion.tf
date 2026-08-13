# EC2 bastion host (Commonsense-EC2).
#
# SSH jump host used to reach the private RDS instance: TablePlus tunnels in on
# :22, and the data-copy GitHub Action opens 3306 on its SG (commonsense-bastion,
# referenced by the AWS_SG_ID secret) for the runner IP.
#
# Small on purpose (t2.nano) and has the SSM profile, so it could later be
# replaced by SSM Session Manager and this file destroyed.

resource "aws_instance" "bastion" {
  ami           = var.bastion_ami
  instance_type = "t2.nano"
  subnet_id     = data.aws_subnet.public_b.id

  key_name             = var.bastion_key_name
  iam_instance_profile = "AmazonSSMRoleForInstancesQuickSetup"

  availability_zone = data.aws_subnet.public_b.availability_zone
  private_ip        = var.bastion_private_ip

  vpc_security_group_ids = [
    aws_security_group.bastion.id,
  ]

  credit_specification {
    cpu_credits = "standard"
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required" # IMDSv2 enforced
    http_put_response_hop_limit = 2
    instance_metadata_tags      = "disabled"
  }

  root_block_device {
    volume_size           = 8
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  tags = {
    Name = "Commonsense-EC2"
  }

  lifecycle {
    # AMI is the launch-time image; never replace the running box over it.
    # user_data likewise shouldn't trigger a destroy.
    ignore_changes = [ami, user_data, user_data_base64]
  }
}
