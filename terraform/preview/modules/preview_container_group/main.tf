# Storage for Caddy

resource "azurerm_storage_account" "cstore" {
  name                      = substr(replace(var.rg_name, "-", ""), 0, 20)
  resource_group_name       = var.rg_name
  location                  = var.location
  account_tier              = "Standard"
  account_replication_type  = "LRS"
  enable_https_traffic_only = true

  tags = {
    "environment" = var.environment
  }
}

resource "azurerm_storage_share" "cshare" {
  name                 = substr(replace(var.rg_name, "-", ""), 0, 20)
  storage_account_name = azurerm_storage_account.cstore.name
  quota                = 1
}

# Containers

resource "azurerm_container_group" "cg" {
  name                = var.rg_name
  location            = var.location
  resource_group_name = var.rg_name
  ip_address_type     = "Public"
  os_type             = "Linux"
  dns_name_label      = var.rg_name

  container {
    name  = "${var.rg_name}-backend"
    image = var.backend_image

    cpu    = 0.5
    memory = 0.5

    environment_variables = {
      "ENVIRONMENT" = var.environment
    }

    secure_environment_variables = {
      "DATABASE_URL" = "postgres://postgres:${var.db_password}@${var.rg_name}.${var.location}.azurecontainer.io:5432/postgres"
      "ADMIN_KEY"    = var.admin_key
      "AUTH_SECRET"  = var.auth_secret
    }
  }

  container {
    name  = "${var.rg_name}-psql"
    image = "postgres:14.5-alpine"

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
    name  = "${var.rg_name}-caddy"
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
      storage_account_name = azurerm_storage_account.cstore.name
      storage_account_key  = azurerm_storage_account.cstore.primary_access_key
      share_name           = azurerm_storage_share.cshare.name
    }

    commands = ["caddy", "reverse-proxy", "--from", "${var.rg_name}.${var.location}.azurecontainer.io", "--to", "localhost:8080"]
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
