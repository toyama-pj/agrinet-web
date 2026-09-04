import type { User } from "~/types/auth"

export function useUserInfo() {
  return useState<User | null>("user-info", () => null)
}

export function useAuth() {
  const { apiFetch } = useApi()
  const user = useUserInfo()

  const busy = ref(false)
  const errors = ref<string[]>([])
  const toastMessage = ref("")
  const otpSent = ref(false)

  async function loadUser() {
    user.value = await apiFetch<User>("/cfg/me")
    return user.value
  }

  async function passwordLogin(
    email: string,
    password: string,
  ) {
    busy.value = true
    errors.value = []

    try {
      await apiFetch("/auth/password/login", {
        method: "POST",
        body: {
          email,
          password,
        },
      })

      await loadUser()
      await navigateTo("/dashboard")
    } catch (error) {
      errors.value.push(getErrorMessage(error))
      throw error
    } finally {
      busy.value = false
    }
  }

  async function requestLoginCode(email: string) {
    busy.value = true
    errors.value = []

    try {
      await apiFetch("/auth/login", {
        method: "POST",
        body: {
          email,
        },
      })

      otpSent.value = true
      toastMessage.value = "確認コードを送信しました"
    } catch (error) {
      errors.value.push(getErrorMessage(error))
      throw error
    } finally {
      busy.value = false
    }
  }

  async function loginWithCode(
    email: string,
    code: string,
  ) {
    busy.value = true
    errors.value = []

    try {
      await apiFetch("/auth/login/callback", {
        method: "POST",
        body: {
          email,
          code,
        },
      })

      otpSent.value = false

      await loadUser()
      await navigateTo("/dashboard")
    } catch (error) {
      errors.value.push(getErrorMessage(error))
      throw error
    } finally {
      busy.value = false
    }
  }

  async function requestRegisterCode(
    name: string,
    email: string,
  ) {
    busy.value = true
    errors.value = []

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: {
          name,
          email,
        },
      })

      otpSent.value = true
      toastMessage.value = "確認コードを送信しました"
    } catch (error) {
      errors.value.push(getErrorMessage(error))
      throw error
    } finally {
      busy.value = false
    }
  }

  async function registerWithCode(
    email: string,
    code: string,
  ) {
    busy.value = true
    errors.value = []

    try {
      await apiFetch("/auth/register/callback", {
        method: "POST",
        body: {
          email,
          code,
        },
      })

      otpSent.value = false

      await loadUser()
      await navigateTo("/dashboard")
    } catch (error) {
      errors.value.push(getErrorMessage(error))
      throw error
    } finally {
      busy.value = false
    }
  }

  async function logout() {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
      })
    } finally {
      user.value = null
      await navigateTo("/login")
    }
  }

  return {
    user,
    busy,
    errors,
    toastMessage,
    otpSent,

    loadUser,
    passwordLogin,
    requestLoginCode,
    loginWithCode,
    requestRegisterCode,
    registerWithCode,
    logout,
  }
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error
  ) {
    const data = (
      error as {
        data?: {
          detail?: string
        }
      }
    ).data

    if (data?.detail) {
      return data.detail
    }
  }

  return "処理に失敗しました"
}