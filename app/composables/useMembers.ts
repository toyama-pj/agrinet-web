import type { NamespaceMember } from "~/types/namespace"

export function useMembers() {
  const { apiFetch } = useApi()

  const namespaceMembers = ref<NamespaceMember[]>([])

  const busy = ref(false)
  const errors = ref<string[]>([])
  const toastMessage = ref("")

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

  async function refreshNamespaceMembers(
    namespaceId: string,
  ) {
    busy.value = true

    try {
      const response = await apiFetch<{
        data: NamespaceMember[]
      }>(
        `/cfg/${namespaceId}/members`,
      )

      namespaceMembers.value = response.data
      errors.value = []
    } catch (error) {
      addError(error)
    } finally {
      busy.value = false
    }
  }

  async function inviteNamespaceMember(
    namespaceId: string,
    email: string,
    grantType: string,
  ) {
    busy.value = true

    try {
      await apiFetch(
        `/cfg/${namespaceId}/invite`,
        {
          method: "POST",
          body: {
            email,
            grant_type: grantType,
          },
        },
      )

      await refreshNamespaceMembers(namespaceId)

      errors.value = []
      showToast("ユーザーの権限を更新しました")
    } catch (error) {
      addError(error)
    } finally {
      busy.value = false
    }
  }

  async function removeNamespaceMember(
    namespaceId: string,
    member: NamespaceMember,
  ) {
    busy.value = true

    try {
      await apiFetch(
        `/cfg/${namespaceId}/disinvite`,
        {
          method: "POST",
          body: {
            email: member.email,
          },
        },
      )

      await refreshNamespaceMembers(namespaceId)

      errors.value = []
      showToast("ユーザーを削除しました")
    } catch (error) {
      addError(error)
    } finally {
      busy.value = false
    }
  }

  function getGrantLabel(grantType: string): string {
    const grantLabels: Record<string, string> = {
      r: "閲覧のみ",
      w: "送信のみ",
      rw: "閲覧・送信",
      admin: "管理者",
    }

    return grantLabels[grantType] ?? grantType
  }

  return {
    namespaceMembers,
    busy,
    errors,
    toastMessage,
    refreshNamespaceMembers,
    inviteNamespaceMember,
    removeNamespaceMember,
    getGrantLabel,
  }
}