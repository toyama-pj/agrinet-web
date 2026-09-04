import type { AddDeviceForm, Device } from "~/types/device"

export function useAddDevice() {
  const { apiFetch } = useApi()

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

  async function addDevice(
    namespaceId: string,
    values: AddDeviceForm,
  ): Promise<Device | null> {
    busy.value = true
    errors.value = []

    try {
      const device = await apiFetch<Device>(
        `/namespaces/${namespaceId}/devices`,
        {
          method: "POST",
          body: values,
        },
      )

      showToast("Deviceを追加しました")

      return device
    } catch (error) {
      addError(error)
      return null
    } finally {
      busy.value = false
    }
  }

  return {
    busy,
    errors,
    toastMessage,
    addDevice,
  }
}