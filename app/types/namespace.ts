import type { Measurement } from "./measurement"

export type GrantType = "r" | "w" | "rw" | "admin"

export interface Namespace {
  namespace_id: string
  organization_id: string
  name: string
  grant_type: GrantType
}

export interface CreateNamespaceResponse {
  namespace_id: string
  grant_type: "admin"
}

export interface NamespacePermission {
  namespace_id: string
  grant_type: GrantType
}

export interface NamespaceWriteTokenExist {
  exists: boolean
}

export interface NamespaceMember {
  user_id: string
  name: string
  email: string
  grant_type: string
}

export interface Metric {
  latest: Measurement
  values: Measurement[]
}