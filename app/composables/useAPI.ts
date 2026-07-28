export function useApi() {
  const config = useRuntimeConfig()
  const token = useAuthToken()

  async function apiFetch<T>(
    path: string,
    options: any = {}
  ): Promise<T> {

    return await $fetch<T>(
      `${config.public.apiBase}${path}`,
      {
        ...options,

        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token.value}`
        }
      }
    )
  }

  return {
    apiFetch
  }
}