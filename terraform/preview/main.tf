terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=3.29.0"
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
  short_rg_name = trim(substr(var.resource_group_name, 0, 25), "_-")
}

# Resource group

resource "azurerm_resource_group" "echo_web" {
  name     = local.short_rg_name
  location = var.location

  tags = {
    environment = var.environment
  }
}

# Storage for preview Caddy

resource "azurerm_storage_account" "caddy_preview_storage" {
  name                      = "${substr(replace(var.resource_group_name, "-", ""), 0, 15)}store"
  resource_group_name       = azurerm_resource_group.echo_web.name
  location                  = var.location
  account_tier              = "Standard"
  account_replication_type  = "LRS"
  enable_https_traffic_only = true

  tags = {
    "environment" = var.environment
  }
}

resource "azurerm_storage_share" "caddy_preview_share" {
  name                 = "${substr(replace(var.resource_group_name, "-", ""), 0, 15)}share"
  storage_account_name = azurerm_storage_account.caddy_preview_storage.name
  quota                = 1
}

# Preview containers

resource "azurerm_container_group" "echo_web_preview" {
  name                = local.short_rg_name
  location            = var.location
  resource_group_name = azurerm_resource_group.echo_web.name
  ip_address_type     = "Public"
  os_type             = "Linux"
  dns_name_label      = local.short_rg_name

  container {
    name  = "${local.short_rg_name}-backend"
    image = var.backend_image

    cpu    = 0.5
    memory = 0.5

    environment_variables = {
      "MAX_POOL_SIZE" = 7
      "ENVIRONMENT"   = var.environment
    }

    secure_environment_variables = {
      "DATABASE_URL" = "postgres://postgres:${var.db_password}@${local.short_rg_name}.${var.location}.azurecontainer.io:5432/postgres"
      "ADMIN_KEY"    = var.admin_key
      "AUTH_SECRET"  = var.auth_secret
    }
  }

  container {
    name  = "${local.short_rg_name}-psql"
    image = "postgres:11.6-alpine"

    cpu    = 0.5
    memory = 0.5

    environment_variables = {
      "POSTGRES_DB"   = "postgres"
      "POSTGRES_USER" = "postgres"
    }

    secure_environment_variables = {
      "POSTGRES_PASSWORD" = var.db_password
    }

    ports {
      port     = 5432
      protocol = "TCP"
    }
  }

  container {
    name  = "${local.short_rg_name}-caddy"
    image = "caddy"

    cpu    = 0.5
    memory = 0.5

    ports {
      port     = 443
      protocol = "TCP"
    }

    ports {
      port     = 80
      protocol = "TCP"
    }

    volume {
      name                 = "caddy-data"
      mount_path           = "/data"
      storage_account_name = azurerm_storage_account.caddy_preview_storage.name
      storage_account_key  = azurerm_storage_account.caddy_preview_storage.primary_access_key
      share_name           = azurerm_storage_share.caddy_preview_share.name
    }

    commands = ["caddy", "reverse-proxy", "--from", "${local.short_rg_name}.${var.location}.azurecontainer.io", "--to", "localhost:8080"]
  }

  exposed_port {
    port     = 443
    protocol = "TCP"
  }

  exposed_port {
    port     = 5432
    protocol = "TCP"
  }

  tags = {
    "environment" = var.environment
  }
}

output "preview_backend_url" {
  value = "https://${azurerm_container_group.echo_web_preview.dns_name_label}.${var.location}.azurecontainer.io"
}
