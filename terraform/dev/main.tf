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

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    environment = var.environment
  }
}

# Database

resource "azurerm_postgresql_server" "echo_web_db" {
  location            = var.location
  name                = var.db_name
  resource_group_name = azurerm_resource_group.echo_web.name

  administrator_login          = var.db_user
  administrator_login_password = var.db_password

  sku_name   = "B_Gen5_1"
  version    = "11"
  storage_mb = 5120

  backup_retention_days        = 7
  geo_redundant_backup_enabled = false
  auto_grow_enabled            = false

  ssl_enforcement_enabled          = true
  ssl_minimal_tls_version_enforced = "TLS1_2"

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    "environment" = var.environment
  }
}

# Firewall for Postgres, allows all traffic from Azure

resource "azurerm_postgresql_firewall_rule" "echo_web_firewall" {
  name                = var.firewall_name
  resource_group_name = azurerm_resource_group.echo_web.name
  server_name         = azurerm_postgresql_server.echo_web_db.name
  start_ip_address    = "0.0.0.0"
  end_ip_address      = "0.0.0.0"

  lifecycle {
    prevent_destroy = true
  }
}

# Storage for Caddy

resource "azurerm_storage_account" "caddy_storage" {
  name                      = "caddy"
  resource_group_name       = var.resource_group_name
  location                  = var.location
  account_tier              = "Standard"
  account_replication_type  = "LRS"
  enable_https_traffic_only = true

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    "environment" = var.environment
  }
}

resource "azurerm_storage_share" "caddy_share" {
  name                 = "caddy"
  storage_account_name = azurerm_storage_account.caddy_storage.name
  quota                = 1

  lifecycle {
    prevent_destroy = true
  }
}

# Containers

resource "azurerm_container_group" "echo_web_containers" {
  name                = var.container_group_name
  location            = var.location
  resource_group_name = var.resource_group_name
  ip_address_type     = "Public"
  os_type             = "Linux"
  dns_name_label      = var.container_group_name

  container {
    name  = var.backend_container_name
    image = var.backend_image_name

    cpu    = 0.5
    memory = 0.5

    environment_variables = {
      "MAX_POOL_SIZE" = "5"
    }

    secure_environment_variables = {
      "DATABASE_URL" = "postgres://${var.db_user}%40${var.db_name}:${var.db_password}@${azurerm_postgresql_server.echo_web_db.fqdn}:5432/postgres"
      "ADMIN_KEY"    = var.admin_key
    }
  }

  container {
    name  = "echo-web-caddy-dev"
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
      storage_account_name = azurerm_storage_account.caddy_storage.name
      storage_account_key  = azurerm_storage_account.caddy_storage.primary_access_key
      share_name           = azurerm_storage_share.caddy_share.name
    }

    commands = ["caddy", "reverse-proxy", "--from", "${var.container_group_name}.${var.location}.azurecontainer.io", "--to", "localhost:8080"]
  }

  exposed_port {
    port     = 443
    protocol = "TCP"
  }

  tags = {
    "environment" = var.environment
  }
}

output "backend_url" {
  value       = "https://${azurerm_container_group.echo_web_containers.fqdn}"
  description = "The URL to the backend"
}
