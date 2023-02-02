output "backend_url" {
  value = var.container_count > 1 ? "https://${azurerm_container_group.load_balancer[0].fqdn}" : "https://${azurerm_container_group.backend[0].fqdn}"
}
