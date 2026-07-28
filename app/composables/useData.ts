import type { KeyValueResponsePayload } from "~/types/data"
import { useAuthToken } from "./useAuth"

interface SensorQuery {
  afterAt?: number
  beforeAt?: number
  limit?: number
  offset?: number
  key?: string
  order?: "ASC" | "DESC"
}

export async function getSensorData(
  namespaceId: string,
  query: SensorQuery = {}
) {
  const { apiFetch } = useApi()
  const authToken = useAuthToken()

  return apiFetch<KeyValueResponsePayload>(`/data/${namespaceId}`, { query })
}