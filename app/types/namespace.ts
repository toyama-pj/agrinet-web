export type GrantType = "r" | "w" | "rw" | "admin"

export interface NamespacePermission {
  namespace_id: string
  grant_type: GrantType
}

export interface NamespaceWriteTokenExist {
  exists: boolean
}