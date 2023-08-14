terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.69.0"
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
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }

  subscription_id = "f16e6916-1e71-42a0-9df3-0246b805f432"
}

# Resource group

resource "azurerm_resource_group" "rg" {
  name     = trim(substr(var.rg_name, 0, 25), "_-")
  location = var.location

  tags = {
    environment = "preview"
  }
}

module "pcg" {
  source        = "./modules/preview_container_group"
  rg_name       = azurerm_resource_group.rg.name
  location      = var.location
  db_password   = var.db_password
  backend_image = var.backend_image
  admin_key     = var.admin_key
  auth_secret   = var.auth_secret
  environment   = "preview"
}
