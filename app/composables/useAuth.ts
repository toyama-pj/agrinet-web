import type { User } from "~/types/auth"

export const useAuthToken = () => {
  return useCookie<string | null>("auth_token")
}

export function useUserInfo() {
  return useState<User>(
    "user-info",
  )
}