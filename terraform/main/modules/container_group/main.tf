# Storage for Caddy

resource "azurerm_storage_account" "cstore" {
  name                      = "${substr(replace(var.cg_name, "-", ""), 0, 19)}store"
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
  name                 = "${substr(replace(var.cg_name, "-", ""), 0, 19)}share"
  storage_account_name = azurerm_storage_account.cstore.name
  quota                = 1
}

# Containers

resource "azurerm_container_group" "cg" {
  name                = var.cg_name
  location            = var.location
  resource_group_name = var.rg_name
  ip_address_type     = "Public"
  os_type             = "Linux"
  dns_name_label      = var.cg_name

  container {
    name  = "echo-web-backend"
    image = "ghcr.io/echo-webkom/echo-web/backend:latest"

    cpu    = 0.5
    memory = 0.5

    environment_variables = {
      "ENVIRONMENT"             = var.environment
      "USE_JWT_TEST"            = var.environment != "production"
      "SEND_EMAIL_REGISTRATION" = var.environment == "production"
    }

    secure_environment_variables = {
      "DATABASE_URL"     = "postgres://${var.db_user}:${var.db_password}@${var.db_fqdn}:5432/postgres"
      "ADMIN_KEY"        = var.admin_key
      "AUTH_SECRET"      = var.auth_secret
      "SENDGRID_API_KEY" = var.sendgrid_api_key
    }
  }

  container {
    name  = "echo-web-caddy"
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

    commands = ["caddy", "reverse-proxy", "--from", "${var.cg_name}.${var.location}.azurecontainer.io", "--to", "localhost:8080"]
  }

  exposed_port {
    port     = 443
    protocol = "TCP"
  }

  diagnostics {
    log_analytics {
      workspace_id  = var.law_wid
      workspace_key = var.law_key
    }
  }

  tags = {
    "environment" = var.environment
  }
}
