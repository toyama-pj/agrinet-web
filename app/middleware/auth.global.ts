import type { User } from "~/types/auth"

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const authToken = useAuthToken()
  const token = authToken.value

  if (!token) {
    if (to.path !== "/login") {
      return navigateTo("/login")
    }
    return
  }

  try {
    const { apiFetch } = useApi()
    const userInfo = useUserInfo()
    userInfo.value = await apiFetch<User>("/cfg/me")

    if (to.path === "/login") {
      return navigateTo("/main")
    }
  } catch {
    authToken.value = null

    if (to.path !== "/login") {
      return navigateTo("/login")
    }
  }
})