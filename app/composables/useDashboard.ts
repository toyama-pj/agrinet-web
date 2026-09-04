import type { Namespace } from "~/types/namespace"
import type { Device, DeviceListResponse } from "~/types/device"
import type {
  Measurement,
  MeasurementResponse,
} from "~/types/measurement"

export function useDashboard() {
  const { apiFetch } = useApi()

  const namespaces = ref<Namespace[]>([])
  const selectedNamespace = ref<Namespace | null>(null)
  const devices = ref<Device[]>([])
  const measurements = ref<Measurement[]>([])

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

  async function loadNamespaces() {
    namespaces.value = await apiFetch<Namespace[]>(
      "/cfg/me/namespace?limit=50",
    )
  }

  async function createDefaultNamespace() {
    busy.value = true

    try {
      await apiFetch("/cfg/me/namespace/create", {
        method: "POST",
      })

      await loadNamespaces()

      errors.value = []
      showToast("Namespaceを作成しました")
    } catch (error) {
      addError(error)
    } finally {
      busy.value = false
    }
  }

  async function openNamespace(namespace: Namespace) {
    selectedNamespace.value = namespace

    const id = namespace.namespace_id

    const [deviceResponse, measurementResponse] = await Promise.all([
      apiFetch<DeviceListResponse>(
        `/namespaces/${id}/devices`,
      ),
      apiFetch<MeasurementResponse>(
        `/namespaces/${id}/measurements?limit=500`,
      ),
    ])

    devices.value = deviceResponse.data
    measurements.value = measurementResponse.data
  }

  return {
    namespaces,
    selectedNamespace,
    devices,
    measurements,

    busy,
    errors,
    toastMessage,

    loadNamespaces,
    createDefaultNamespace,
    openNamespace,
  }
}