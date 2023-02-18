# Prod-specific variables

locals {
  db_name     = "echo-web-db-prod"
  db_user     = "echoadminprod"
  environment = "production"
}

# Resource group

resource "azurerm_resource_group" "rg" {
  name     = "echo-web-prod"
  location = var.location

  tags = {
    environment = local.environment
  }
}

# Logging workspace

resource "azurerm_log_analytics_workspace" "law" {
  name                = "backend-logs-prod"
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name
  retention_in_days   = 30
}

module "db" {
  source = "../modules/postgres"

  rg_name     = azurerm_resource_group.rg.name
  location    = azurerm_resource_group.rg.location
  environment = local.environment
  db_name     = local.db_name
  db_user     = local.db_user
  db_password = var.db_password
}

module "ca" {
  source = "../modules/container_app"

  rg_name          = azurerm_resource_group.rg.name
  law_id           = azurerm_log_analytics_workspace.law.id
  location         = azurerm_resource_group.rg.location
  environment      = local.environment
  db_user          = local.db_user
  db_password      = var.db_password
  db_fqdn          = module.db.fqdn
  admin_key        = var.admin_key
  auth_secret      = var.auth_secret
  sendgrid_api_key = var.sendgrid_api_key
  revision_suffix  = var.revision_suffix
}
