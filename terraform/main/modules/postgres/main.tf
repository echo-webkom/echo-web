# Database

resource "azurerm_postgresql_flexible_server" "db" {
  location            = var.location
  name                = var.db_name
  resource_group_name = var.rg_name

  administrator_login    = var.db_user
  administrator_password = var.db_password

  sku_name   = "B_Standard_B1ms"
  version    = "14"
  storage_mb = 32768

  backup_retention_days = 7

  zone = 1

  tags = {
    "environment" = var.environment
  }

  lifecycle {
    ignore_changes = [
      zone
    ]

    prevent_destroy = true
  }
}

# Firewall for Postgres, allows all traffic from Azure

resource "azurerm_postgresql_flexible_server_firewall_rule" "db_firewall" {
  name             = "${var.db_name}-firewall"
  server_id        = azurerm_postgresql_flexible_server.db.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}
