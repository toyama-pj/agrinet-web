export function useApi() {
  const config = useRuntimeConfig()

  async function apiFetch<T>(
    path: string,
    options: any = {},
  ): Promise<T> {
    return await $fetch<T>(
      `${config.public.apiBase}${path}`,
      {
        ...options,
        credentials: "include",
      },
    )
  }

  return {
    apiFetch,
  }
}