variable "resource_group_name" {
  type = string
  description = "The name of the resource group in which to create the resources."
}

variable "location" {
  type        = string
  description = "The Azure location where the resources should be created."
}

variable "db_password" {
  type        = string
  description = "The admin password for the database."
}

variable "backend_image" {
  type        = string
  description = "The image to use for the backend."
}

variable "admin_key" {
  type        = string
  description = "The ADMIN_KEY to use for the backend."
}
