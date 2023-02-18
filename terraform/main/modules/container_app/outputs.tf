output "backend_url" {
  value = "https://${azurerm_container_app.backend.ingress.0.fqdn}"
}
