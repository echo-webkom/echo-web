variable "rg_name" {
  type        = string
  description = "The name of the resource group in which to create the resources."
}

variable "law_id" {
  type        = string
  description = "The ID of the Log Analytics workspace."
}

variable "location" {
  type        = string
  description = "The Azure location where the resources should be created."
  default     = "norwayeast"
}

variable "environment" {
  type        = string
  description = "Tags the resources with the environment, and sets backend environment."

  validation {
    condition     = contains(["production", "development", "preview"], var.environment)
    error_message = "Valid values for environment are: 'production', 'development' and 'preview'."
  }
}

variable "db_user" {
  type        = string
  description = "The name of the admin database user."
}

variable "db_password" {
  type        = string
  description = "The password for the admin database user."
}

variable "db_fqdn" {
  type        = string
  description = "The fully qualified domain name (URL, basically) of the database."
}

variable "admin_key" {
  type        = string
  description = "The ADMIN_KEY to use for the backend."
}

variable "auth_secret" {
  type        = string
  description = "The AUTH_SECRET for the development and preview backend."
}

variable "sendgrid_api_key" {
  type        = string
  description = "The API key for SendGrid."
}

variable "revision_suffix" {
  type        = string
  description = "The revision suffix to use for the new revision of the Container App."
}
