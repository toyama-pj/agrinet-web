export interface User {
  ID: string
  Name: string
  Email: string
  CreatedAt: string
  UpdatedAt: string
}

export interface UserBearerToken {
  id: number
  user_id: string
  token: string
  created_at: string
  updated_at: string
  expires_at: string
}