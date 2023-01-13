terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.38.0"
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

  location    = var.location
  cg_name     = "echo-web-prod"
  db_password = var.db_password_prod
  admin_key   = var.admin_key_prod
}

module "dev" {
  source = "./dev"

  location    = var.location
  cg_name     = "echo-web-dev"
  db_password = var.db_password_dev
  admin_key   = var.admin_key_dev
  auth_secret = var.auth_secret
}
