# Main containers

resource "azurerm_container_app_environment" "backend_env" {
  name                       = "${var.rg_name}-env"
  location                   = var.location
  resource_group_name        = var.rg_name
  log_analytics_workspace_id = var.law_id

  tags = {
    "environment" = var.environment
  }
}

resource "azurerm_container_app" "backend" {
  name                         = var.rg_name
  container_app_environment_id = azurerm_container_app_environment.backend_env.id
  resource_group_name          = var.rg_name
  revision_mode                = "Single"

  template {
    container {
      name   = "backend"
      image  = "ghcr.io/echo-webkom/echo-web/backend:latest"
      cpu    = var.environment == "production" ? "0.5" : "0.25"
      memory = var.environment == "production" ? "1Gi" : "0.5Gi"

      liveness_probe {
        transport = "HTTP"
        path      = "/status"
        port      = "8080"
      }

      readiness_probe {
        transport = "HTTP"
        path      = "/status"
        port      = "8080"
      }

      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }

      env {
        name  = "USE_JWT_TEST"
        value = var.environment != "production"
      }

      env {
        name  = "SEND_EMAIL_REGISTRATION"
        value = "true"
      }

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url"
      }

      env {
        name        = "ADMIN_KEY"
        secret_name = "admin-key"
      }

      env {
        name  = "AUTH_SECRET"
        value = "auth-secret"
      }

      env {
        name        = "SENDGRID_API_KEY"
        secret_name = "sendgrid-api-key"
      }
    }

    min_replicas    = var.environment == "production" ? 1 : 0
    max_replicas    = var.environment == "production" ? 2 : 1
    revision_suffix = substr(var.revision_suffix, 0, 10)
  }

  ingress {
    target_port      = "8080"
    external_enabled = true

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  secret {
    name  = "database-url"
    value = "postgres://${var.db_user}:${var.db_password}@${var.db_fqdn}:5432/postgres"
  }

  secret {
    name  = "admin-key"
    value = var.admin_key
  }

  secret {
    name  = "auth-secret"
    value = var.auth_secret
  }

  secret {
    name  = "sendgrid-api-key"
    value = var.sendgrid_api_key
  }

  tags = {
    "environment" = var.environment
  }
}
