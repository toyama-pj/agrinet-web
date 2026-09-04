import type { Passkey, PasskeyConfigResponse, PasskeyListResponse, PasskeyRegisterBeginResponse, PasswordResponse } from "~/types/setting"

export function useSettings() {
  const { apiFetch } = useApi()
  const user = useUserInfo()

  const passwordConfigured = ref(false)
  const passkeys = ref<Passkey[]>([])
  const passkeyEnabled = ref(false)

  const busy = ref(false)
  const errors = ref<string[]>([])
  const toastMessage = ref("")

  const email = computed(() => user.value?.Email ?? "")

  const passkeySupported = computed(() => {
    return (
      passkeyEnabled.value &&
      typeof window !== "undefined" &&
      !!window.PublicKeyCredential &&
      !!navigator.credentials
    )
  })

  function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }

    return "予期しないエラーが発生しました"
  }

  function addError(error: unknown) {
    errors.value.push(getErrorMessage(error))
  }

  function showToast(message: string) {
    toastMessage.value = message

    setTimeout(() => {
      toastMessage.value = ""
    }, 2800)
  }

  async function loadSettings() {
    busy.value = true

    try {
      const [password, passkeyResponse] = await Promise.all([
        apiFetch<PasswordResponse>("/auth/password"),
        apiFetch<PasskeyListResponse>("/auth/passkeys"),
      ])

      passwordConfigured.value = Boolean(password.configured)
      passkeys.value = passkeyResponse.data ?? []
      errors.value = []
    } catch (error) {
      addError(error)
    } finally {
      busy.value = false
    }
  }

  async function loadPasskeyConfig() {
    try {
      const config = await apiFetch<PasskeyConfigResponse>(
        "/auth/passkeys/config",
      )

      passkeyEnabled.value = Boolean(config.enabled)
    } catch {
      passkeyEnabled.value = false
    }
  }

  async function updatePassword(
    currentPassword: string,
    newPassword: string,
    confirmation: string,
  ): Promise<boolean> {
    if (newPassword !== confirmation) {
      addError(new Error("新しいパスワードが一致しません"))
      return false
    }

    busy.value = true

    try {
      await apiFetch("/auth/password", {
        method: "PUT",
        body: {
          current_password: currentPassword,
          new_password: newPassword,
        },
      })

      passwordConfigured.value = true
      errors.value = []

      showToast(
        "パスワードを保存しました。他のログインセッションは失効しました。",
      )

      return true
    } catch (error) {
      addError(error)
      return false
    } finally {
      busy.value = false
    }
  }

  async function registerPasskey(name: string): Promise<boolean> {
    busy.value = true

    try {
      const begin = await apiFetch<PasskeyRegisterBeginResponse>(
        "/auth/passkeys/register/begin",
        {
          method: "POST",
          body: { name },
        },
      )

      const publicKey = parseCreationOptions(begin.options.publicKey)

      const credential = await navigator.credentials.create({
        publicKey,
      })

      if (!(credential instanceof PublicKeyCredential)) {
        throw new Error("パスキーの登録に失敗しました")
      }

      await apiFetch("/auth/passkeys/register/finish", {
        method: "POST",
        body: credentialToJSON(credential),
        headers: {
          "X-Passkey-Ceremony-ID": begin.ceremony_id,
        },
      })

      await refreshPasskeys()

      errors.value = []
      showToast("パスキーを登録しました")

      return true
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "NotAllowedError")) {
        addError(error)
      }

      return false
    } finally {
      busy.value = false
    }
  }

  async function refreshPasskeys() {
    const response = await apiFetch<PasskeyListResponse>("/auth/passkeys")
    passkeys.value = response.data ?? []
  }

  async function deletePasskey(id: string): Promise<boolean> {
    try {
      await apiFetch(`/auth/passkeys/${id}`, {
        method: "DELETE",
      })

      passkeys.value = passkeys.value.filter(
        passkey => passkey.id !== id,
      )

      errors.value = []
      showToast("パスキーを削除しました")

      return true
    } catch (error) {
      addError(error)
      return false
    }
  }

  function parseCreationOptions(
    options: PublicKeyCredentialCreationOptionsJSON,
  ): PublicKeyCredentialCreationOptions {
    if (
      typeof PublicKeyCredential.parseCreationOptionsFromJSON === "function"
    ) {
      return PublicKeyCredential.parseCreationOptionsFromJSON(options)
    }

    return {
      ...options,
      challenge: fromBase64URL(options.challenge),
      user: {
        ...options.user,
        id: fromBase64URL(options.user.id),
      },
      excludeCredentials: options.excludeCredentials?.map(item => ({
        ...item,
        id: fromBase64URL(item.id),
      })),
    } as unknown as PublicKeyCredentialCreationOptions
  }

  function credentialToJSON(
    credential: PublicKeyCredential,
  ) {
    const response = credential.response as AuthenticatorAttestationResponse

    const responseData: Record<string, unknown> = {}

    for (const key of [
      "clientDataJSON",
      "attestationObject",
      "authenticatorData",
      "signature",
      "userHandle",
    ]) {
      const value = response[key as keyof AuthenticatorAttestationResponse]

      if (value instanceof ArrayBuffer) {
        responseData[key] = toBase64URL(value)
      } else if (value === null) {
        responseData[key] = null
      }
    }

    if (response.getTransports) {
      responseData.transports = response.getTransports()
    }

    return {
      id: credential.id,
      rawId: toBase64URL(credential.rawId),
      type: credential.type,
      authenticatorAttachment: credential.authenticatorAttachment,
      response: responseData,
      clientExtensionResults: credential.getClientExtensionResults(),
    }
  }

  function fromBase64URL(value: string): ArrayBuffer {
    const padding = "=".repeat((4 - value.length % 4) % 4)

    const binary = atob(
      value.replaceAll("-", "+").replaceAll("_", "/") + padding,
    )

    return Uint8Array.from(
      binary,
      character => character.charCodeAt(0),
    ).buffer
  }

  function toBase64URL(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ""

    for (const byte of bytes) {
      binary += String.fromCharCode(byte)
    }

    return btoa(binary)
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .replaceAll("=", "")
  }

  return {
    email,

    passwordConfigured,
    passkeys,
    passkeyEnabled,
    passkeySupported,

    busy,
    errors,
    toastMessage,

    loadSettings,
    loadPasskeyConfig,
    updatePassword,
    registerPasskey,
    refreshPasskeys,
    deletePasskey,
  }
}