variable "location" {
  type        = string
  description = "The Azure location where the resources should be created."
  default     = "norwayeast"
}

variable "container_count" {
  type        = number
  description = "The number of containers to create."
}

variable "db_password" {
  type        = string
  description = "The password for the admin database user."
}

variable "admin_key" {
  type        = string
  description = "The ADMIN_KEY to use for the backend."
}

variable "sendgrid_api_key" {
  type        = string
  description = "The API key for SendGrid."
}
