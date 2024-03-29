variable "location" {
  type        = string
  description = "The Azure location where the resources should be created."
  default     = "norwayeast"
}

variable "db_password" {
  type        = string
  description = "The password for the admin database user."
}

variable "admin_key" {
  type        = string
  description = "The ADMIN_KEY to use for the backend."
}

variable "auth_secret" {
  type        = string
  description = "The AUTH_SECRET for the backend."
}

variable "sendgrid_api_key" {
  type        = string
  description = "The API key for SendGrid."
}

variable "revision_suffix" {
  type        = string
  description = "The revision suffix to use for the new revision of the Container App."
}
