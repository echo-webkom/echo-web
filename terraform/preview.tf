# Storage for preview Caddy

resource "azurerm_storage_account" "caddy_preview_storage" {
  for_each = var.preview_containers

  name                      = "${substr(replace(each.key, "-", ""), 0, 15)}store"
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
  for_each = var.preview_containers

  name                 = "${substr(replace(each.key, "-", ""), 0, 15)}share"
  storage_account_name = azurerm_storage_account.caddy_preview_storage[each.key].name
  quota                = 1
}

# Preview containers

resource "azurerm_container_group" "echo_web_preview_containers" {
  for_each = var.preview_containers

  name                = each.key
  location            = var.location
  resource_group_name = var.resource_group_name
  ip_address_type     = "Public"
  os_type             = "Linux"
  dns_name_label      = each.key

  container {
    name  = "${each.key}-backend"
    image = each.value.image

    cpu    = 0.5
    memory = 0.5

    environment_variables = {
      "MAX_POOL_SIZE" = "5"
    }

    secure_environment_variables = {
      "DATABASE_URL" = "postgres://${var.db_user}%40${var.db_name}:${var.db_password}@${azurerm_postgresql_server.echo_web_db.fqdn}:5432/postgres"
      "ADMIN_KEY"    = each.value.admin_key
    }
  }
  container {
    name  = "${each.key}-caddy"
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

    commands = ["caddy", "reverse-proxy", "--from", "${each.key}.norwayeast.azurecontainer.io", "--to", "localhost:8080"]
  }

  exposed_port {
    port     = 443
    protocol = "TCP"
  }

  tags = {
    "environment" = "preview"
  }
}

output "preview_backend_url" {
  value = [
    for echo_web_preview_containers in azurerm_container_group.echo_web_preview_containers : "https://${echo_web_preview_containers.fqdn}"
  ]
}
