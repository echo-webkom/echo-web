variable "resource_group_name" {
  type        = string
  description = "The name of the resource group in which to create the resources."
}

variable "location" {
  type        = string
  description = "The Azure location where the resources should be created."
}

variable "environment" {
  type        = string
  description = "Tags the resources with the environment."
}

variable "db_user" {
  type        = string
  description = "The admin username for the database."
}

variable "db_password" {
  type        = string
  description = "The admin password for the database."
}

variable "db_name" {
  type        = string
  description = "The name of the database resource (not actual database name)."
}

variable "firewall_name" {
  type        = string
  description = "The name of the firewall rule for database."
}

variable "container_group_name" {
  type        = string
  description = "The name of the container group."
}

variable "backend_container_name" {
  type        = string
  description = "The name of the container for the backend."
}

variable "backend_image_name" {
  type    = string
  default = "ghcr.io/echo-webkom/echo-web/backend:latest"
}

variable "admin_key" {
  type        = string
  description = "The ADMIN_KEY for the backend."
}
