variable "resource_group_name" {
  type        = string
  description = "The name of the resource group in which to create the resources."
}

variable "location" {
  type        = string
  description = "The Azure location where the resources should be created."
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

variable "db_fqdn" {
  type        = string
  description = "The fully qualified domain name of the database."
}

variable "preview_containers" {
  type    = map(map(string))
  default = {}
}
