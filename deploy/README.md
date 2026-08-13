# Infrastructure (Terraform)

Terraform for the AWS stack (`us-east-1`).

Copy `terraform.tfvars.example` to `terraform.tfvars` and fill in your values,
then:

```sh
cd deploy
terraform init
terraform plan
terraform apply
```

Notes:

- The VPC, subnets, route tables and IGW are managed by UPenn ISC. They are
  read-only `data` sources here — don't manage them.
- The ACM cert is referenced by ARN (no read access).
- `server.env` (S3) holds secrets and is intentionally not managed by Terraform.
- State is local. Move to a remote backend before sharing.
