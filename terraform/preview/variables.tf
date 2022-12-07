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
  description = "Tags the resources with the environment, and sets backend environment."

  validation {
    condition     = contains(["production", "development", "preview"], var.environment)
    error_message = "Valid values for environment are: 'production', 'development' and 'preview'."
  }
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

variable "auth_secret" {
  type        = string
  description = "The AUTH_SECRET to use for the backend."
}
