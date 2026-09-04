import type { User } from "~/types/auth"

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const { apiFetch } = useApi()
  const userInfo = useUserInfo()

  try {
    userInfo.value = await apiFetch<User>("/cfg/me")

    if (to.path === "/login") {
      return navigateTo("/dashboard")
    }
  } catch {
    userInfo.value = null

    if (to.path !== "/login") {
      return navigateTo("/login")
    }
  }
})