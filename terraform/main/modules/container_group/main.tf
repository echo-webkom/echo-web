locals {
  cg_fqdns          = [for n in range(var.container_count) : "https://${var.rg_name}-${n}.${var.location}.azurecontainer.io"]
  formatted_rg_name = substr(replace(var.rg_name, "-", ""), 0, 16)
}

# Storage for Caddy load balancer

resource "azurerm_storage_account" "load_balancer" {
  count = var.container_count > 1 ? 1 : 0

  name                      = "${substr(replace(var.rg_name, "-", ""), 0, 17)}lb"
  resource_group_name       = var.rg_name
  location                  = var.location
  account_tier              = "Standard"
  account_replication_type  = "LRS"
  enable_https_traffic_only = true

  tags = {
    "environment" = var.environment
  }
}

resource "azurerm_storage_share" "load_balancer" {
  count = var.container_count > 1 ? 1 : 0

  name                 = "${local.formatted_rg_name}lb"
  storage_account_name = azurerm_storage_account.load_balancer[0].name
  quota                = 1
}

# Caddy for load balancing

resource "azurerm_container_group" "load_balancer" {
  count = var.container_count > 1 ? 1 : 0

  name                = var.rg_name
  location            = var.location
  resource_group_name = var.rg_name
  ip_address_type     = "Public"
  os_type             = "Linux"
  dns_name_label      = var.rg_name

  container {
    name  = "load-balancer"
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
      name       = "config"
      read_only  = true
      mount_path = "/etc/caddy"
      secret = {
        "Caddyfile" = base64encode(<<-EOF
          ${var.rg_name}.${var.location}.azurecontainer.io

          reverse_proxy {
            ${join("\n  ", formatlist("to %s", local.cg_fqdns))}

            health_uri /status
            health_interval 15s
            health_timeout 8s

            lb_policy round_robin

            fail_duration 15s
            unhealthy_status 5xx

            header_up Host {upstream_hostport}
            header_down Access-Control-Allow-Origin *
            header_down Access-Control-Allow-Methods *
            header_down Access-Control-Allow-Headers *
            header_down Access-Control-Allow-Credentials true
          }

          EOF
        ),
      }
    }

    volume {
      name                 = "caddy-data"
      mount_path           = "/data"
      storage_account_name = azurerm_storage_account.load_balancer[0].name
      storage_account_key  = azurerm_storage_account.load_balancer[0].primary_access_key
      share_name           = azurerm_storage_share.load_balancer[0].name
    }
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


# Storage for backend Caddy

resource "azurerm_storage_account" "backend" {
  count = var.container_count

  name                      = var.container_count > 1 ? "${local.formatted_rg_name}rp${count.index}" : "${local.formatted_rg_name}rp"
  resource_group_name       = var.rg_name
  location                  = var.location
  account_tier              = "Standard"
  account_replication_type  = "LRS"
  enable_https_traffic_only = true

  tags = {
    "environment" = var.environment
  }
}

resource "azurerm_storage_share" "backend" {
  count = var.container_count

  name                 = var.container_count > 1 ? "${local.formatted_rg_name}rp${count.index}" : "${local.formatted_rg_name}rp"
  storage_account_name = azurerm_storage_account.backend[count.index].name
  quota                = 1
}

# Main containers

resource "azurerm_container_group" "backend" {
  count = var.container_count

  name                = var.container_count > 1 ? "${var.rg_name}-${count.index}" : var.rg_name
  location            = var.location
  resource_group_name = var.rg_name
  ip_address_type     = "Public"
  os_type             = "Linux"
  dns_name_label      = var.container_count > 1 ? "${var.rg_name}-${count.index}" : var.rg_name

  container {
    name  = "backend"
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
    name  = "reverse-proxy"
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
      name       = "config"
      read_only  = true
      mount_path = "/etc/caddy"
      secret = {
        "Caddyfile" = base64encode(<<-EOF
          ${var.container_count > 1 ? "${var.rg_name}-${count.index}.${var.location}.azurecontainer.io" : "${var.rg_name}.${var.location}.azurecontainer.io"}

          reverse_proxy localhost:8080

          EOF
        ),
      }
    }

    volume {
      name                 = "caddy-data"
      mount_path           = "/data"
      storage_account_name = azurerm_storage_account.backend[count.index].name
      storage_account_key  = azurerm_storage_account.backend[count.index].primary_access_key
      share_name           = azurerm_storage_share.backend[count.index].name
    }
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
