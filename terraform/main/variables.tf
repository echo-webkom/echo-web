variable "location" {
  type        = string
  description = "The Azure location where the resources should be created."
  default     = "norwayeast"
}

variable "db_password_prod" {
  type        = string
  description = "The password for the admin user on the production database."
}

variable "db_password_dev" {
  type        = string
  description = "The password for the admin user on the development database."
}

variable "admin_key_prod" {
  type        = string
  description = "The ADMIN_KEY to use for the production backend."
}

variable "admin_key_dev" {
  type        = string
  description = "The ADMIN_KEY to use for the development backend."
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
