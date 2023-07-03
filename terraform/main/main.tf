terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.63.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "echo-web-tfstate"
    storage_account_name = "echowebtfstatestore"
    container_name       = "tfstate"
    key                  = "azure.terraform.tfstate"
  }
}

provider "azurerm" {
  features {}

  subscription_id = "f16e6916-1e71-42a0-9df3-0246b805f432"
}

locals {
  location = "norwayeast"
}

module "prod" {
  source = "./prod"

  location         = var.location
  db_password      = var.db_password_prod
  admin_key        = var.admin_key_prod
  auth_secret      = var.auth_secret
  sendgrid_api_key = var.sendgrid_api_key
  revision_suffix  = var.revision_suffix
}

module "dev" {
  source = "./dev"

  location         = var.location
  db_password      = var.db_password_dev
  admin_key        = var.admin_key_dev
  auth_secret      = var.auth_secret
  sendgrid_api_key = var.sendgrid_api_key
  revision_suffix  = var.revision_suffix
}
