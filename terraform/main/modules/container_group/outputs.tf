output "backend_url" {
  value = "https://${azurerm_container_group.cg.fqdn}"
}
