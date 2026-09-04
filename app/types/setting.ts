export interface PasswordResponse {
  configured: boolean
}

export interface Passkey {
  id: string
  name: string
  created_at: string
  last_used_at?: string | null
}

export interface PasskeyConfigResponse {
  enabled: boolean
}

export interface PasskeyRegisterBeginResponse {
  ceremony_id: string
  options: {
    publicKey: PublicKeyCredentialCreationOptionsJSON
  }
}

export interface PasskeyListResponse {
  data: Passkey[]
}