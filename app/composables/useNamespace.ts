import type { NamespacePermission } from "~/types/namespace"

export async function getNamespacePermission() {
  const { apiFetch } = useApi()

  return await apiFetch<NamespacePermission[]>(
    "/cfg/me/namespace"
  )
}

export function useNamespacePermission() {
  return useState<NamespacePermission[]>(
    "namespace-permission",
    () => []
  )
}

export function useNamespaces(namespacePermission: NamespacePermission[]) {
    return (namespacePermission ?? []).map((item: NamespacePermission, index) => ({
    id: item.namespace_id,
    displayName: `名前空間${index + 1}`,
    grantType: item.grant_type,
  }))
}

export function useLoadNamespacePermission() {

  const namespacePermission = useNamespacePermission()

  const loading = ref(false)

  const loadError = ref(false)

  async function loadNamespaces(force = false) {

    if (
      !force &&
      namespacePermission.value.length > 0
    ) {
      return
    }

    loading.value = true
    loadError.value = false

    try {

      namespacePermission.value =
        await getNamespacePermission()

    } catch (e) {

      console.error(e)

      loadError.value = true

    } finally {

      loading.value = false

    }

  }

  return {
    namespacePermission,
    loading,
    loadError,
    loadNamespaces
  }
}