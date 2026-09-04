import type { Namespace, NamespaceMember, Metric } from "~/types/namespace"
import type { Device } from "~/types/device"
import type {
  Measurement,
  MeasurementResponse,
} from "~/types/measurement"

const metricLabels: Record<string, [string, string]> = {
  temperature: ["気温", "°C"],
  relative_humidity: ["湿度", "%"],
  barometric_pressure: ["気圧", "hPa"],
  illuminance: ["照度", "lx"],
  presence: ["人感", ""],
  digital_input: ["デジタル入力", ""],
  digital_output: ["デジタル出力", ""],
  analog_input: ["アナログ入力", ""],
  analog_output: ["アナログ出力", ""],
  accelerometer: ["加速度", "g"],
  gyrometer: ["角速度", "°/s"],
  gps: ["位置", ""],
}

export function useNamespace() {
  const { apiFetch } = useApi()

  const namespace = ref<Namespace | null>(null)
  const devices = ref<Device[]>([])
  const measurements = ref<Measurement[]>([])

  const busy = ref(false)
  const errors = ref<string[]>([])
  const toastMessage = ref("")

  const metrics = computed(() => {
    return groupMetrics(measurements.value)
  })

  const canManage = computed(() => {
    return namespace.value?.grant_type === "admin"
  })

  /*
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
  */

  async function loadNamespace(namespaceId: string) {
  const [namespaceResponse, deviceResponse, measurementResponse] =
    await Promise.all([
      apiFetch<Namespace[]>(
        "/cfg/me/namespace?limit=50",
      ),
      apiFetch<{ data: Device[] }>(
        `/namespaces/${namespaceId}/devices`,
      ),
      apiFetch<MeasurementResponse>(
        `/namespaces/${namespaceId}/measurements?limit=500`,
      ),
    ])

  const foundNamespace = namespaceResponse.find(
    item => item.namespace_id === namespaceId,
  )

  if (!foundNamespace) {
    throw new Error("Namespaceが見つかりません")
  }

  namespace.value = foundNamespace
  devices.value = deviceResponse.data
  measurements.value = measurementResponse.data
}

  function groupMetrics(
    values: Measurement[],
  ): Metric[] {
    const groups = new Map<string, Measurement[]>()

    for (const measurement of values) {
      const key =
        `${measurement.device_id}:${measurement.channel}:${measurement.name}`

      if (!groups.has(key)) {
        groups.set(key, [])
      }

      groups.get(key)!.push(measurement)
    }

    return [...groups.values()]
      .map(values => ({
        latest: values[0]!,
        values,
      }))
      .sort(
        (a, b) =>
          new Date(b.latest.received_at).getTime() -
          new Date(a.latest.received_at).getTime(),
      )
  }

  function formatValue(value: unknown): string {
    if (typeof value === "number") {
      return value.toFixed(1)
    }

    if (typeof value === "boolean") {
      return value ? "ON" : "OFF"
    }

    if (value && typeof value === "object") {
      return Object.values(value)
        .map(item =>
          typeof item === "number"
            ? item.toFixed(2)
            : String(item),
        )
        .join(" / ")
    }

    return String(value ?? "--")
  }

  function getMetricLabel(name: string): string {
    return metricLabels[name]?.[0] ?? name
  }

  function getMetricUnit(name: string): string {
    return metricLabels[name]?.[1] ?? ""
  }

  function getDevice(measurement: Measurement): Device | undefined {
    return devices.value.find(
      device => device.id === measurement.device_id,
    )
  }

  return {
    namespace,
    devices,
    measurements,

    busy,
    errors,
    toastMessage,

    metrics,
    canManage,

    loadNamespace,

    formatValue,
    getMetricLabel,
    getMetricUnit,
    getDevice,
  }
}