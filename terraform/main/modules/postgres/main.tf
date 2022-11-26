# Database

resource "azurerm_postgresql_server" "db" {
  location            = var.location
  name                = var.db_name
  resource_group_name = var.rg_name

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

  tags = {
    "environment" = var.environment
  }
}

# Firewall for Postgres, allows all traffic from Azure

resource "azurerm_postgresql_firewall_rule" "db_firewall" {
  name                = "${var.db_name}-firewall"
  resource_group_name = var.rg_name
  server_name         = azurerm_postgresql_server.db.name
  start_ip_address    = "0.0.0.0"
  end_ip_address      = "0.0.0.0"
}
