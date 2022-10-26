terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=3.28.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "echo-web-tfstate"
    storage_account_name = "echowebtfstatestorage"
    container_name       = "tfstate"
    key                  = "azure.terraform.tfstate"
  }
}

provider "azurerm" {
  features {}

  subscription_id = "8afc7368-510a-404a-b4dd-c7351977b037"
}

# Resource group

resource "azurerm_resource_group" "echo_web" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    environment = "preview"
  }
}

# Storage for preview Caddy

resource "azurerm_storage_account" "caddy_preview_storage" {
  name                      = "${substr(replace(var.resource_group_name, "-", ""), 0, 15)}store"
  resource_group_name       = var.resource_group_name
  location                  = var.location
  account_tier              = "Standard"
  account_replication_type  = "LRS"
  enable_https_traffic_only = true

  tags = {
    "environment" = "preview"
  }
}

resource "azurerm_storage_share" "caddy_preview_share" {
  name                 = "${substr(replace(var.resource_group_name, "-", ""), 0, 15)}share"
  storage_account_name = azurerm_storage_account.caddy_preview_storage.name
  quota                = 1
}

# Preview containers

resource "azurerm_container_group" "echo_web_preview" {
  name                = var.resource_group_name
  location            = var.location
  resource_group_name = var.resource_group_name
  ip_address_type     = "Public"
  os_type             = "Linux"
  dns_name_label      = var.resource_group_name

  container {
    name  = "${var.resource_group_name}-backend"
    image = var.backend_image

    cpu    = 0.5
    memory = 0.5

    environment_variables = {
      "MAX_POOL_SIZE" = "5"
      "DEV"           = "jaj"
    }

    secure_environment_variables = {
      "DATABASE_URL" = "postgres://postgres:${var.db_password}@${var.resource_group_name}.${var.location}.azurecontainer.io:5432/postgres"
      "ADMIN_KEY"    = var.admin_key
    }
  }

  container {
    name = "${var.resource_group_name}-psql"
    image = "postgres:11.6-alpine"

    cpu    = 0.5
    memory = 0.5

    environment_variables = {
      "POSTGRES_DB"       = "postgres"
      "POSTGRES_USER"     = "postgres"
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
    name  = "${var.resource_group_name}-caddy"
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

    commands = ["caddy", "reverse-proxy", "--from", "${var.resource_group_name}.${var.location}.azurecontainer.io", "--to", "localhost:8080"]
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
    "environment" = "preview"
  }
}

output "preview_backend_url" {
  value = "https://${azurerm_container_group.echo_web_preview.dns_name_label}.${var.location}.azurecontainer.io"
}
