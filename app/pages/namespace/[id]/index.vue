<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const {
  namespace,
  devices,
  metrics,
  busy,
  errors,
  canManage,
  loadNamespace,
  formatValue,
  getMetricLabel,
  getMetricUnit,
  getDevice,
} = useNamespace()



const { logout } = useAuth()

const namespaceId = computed(() => {
  return String(route.params.id)
})

function formatAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = Date.now()
  const diff = Math.floor((now - date.getTime()) / 1000)

  if (diff < 60) {
    return `${diff}秒前`
  }

  const minutes = Math.floor(diff / 60)

  if (minutes < 60) {
    return `${minutes}分前`
  }

  const hours = Math.floor(minutes / 60)

  if (hours < 24) {
    return `${hours}時間前`
  }

  const days = Math.floor(hours / 24)

  return `${days}日前`
}

function sparkline(
  values: Array<{ received_at: string; value: unknown }>,
): string {
  const numericValues = values
    .map(item => {
      return typeof item.value === "number" ? item.value : null
    })
    .filter((value): value is number => value !== null)

  if (numericValues.length < 2) {
    return ""
  }

  const width = 120
  const height = 36
  const padding = 5

  const min = Math.min(...numericValues)
  const max = Math.max(...numericValues)
  const range = max - min || 1

  const points = numericValues
    .map((value, index) => {
      const x =
        padding +
        (index / (numericValues.length - 1)) *
          (width - padding * 2)

      const y =
        height -
        padding -
        ((value - min) / range) *
          (height - padding * 2)

      return `${x},${y}`
    })
    .join(" ")

  const last = points.split(" ").at(-1)!.split(",")

  return `
    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points="${points}"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle
        cx="${last[0]}"
        cy="${last[1]}"
        r="3"
      />
    </svg>
  `
}

async function handleBack() {
  await router.push("/dashboard")
}

async function handleMembers() {
  await router.push(
    `/namespace/${namespaceId.value}/members`,
  )
}

async function handleAddDevice() {
  await router.push(
    `/namespace/${namespaceId.value}/add-device`,
  )
}


const loading = ref(true)

onMounted(async () => {
  try {
    await loadNamespace(namespaceId.value)
  } catch (error) {
    errors.value.push(
      error instanceof Error
        ? error.message
        : "Namespaceの読み込みに失敗しました",
    )
  } finally {
    loading.value = false
  }
})
/*
import type { Metric } from "~/types/namespace"

const dummyMetrics: Metric[] = [
  {
    latest: {
      device_id: "dummy-device-1",
      namespace_id: "dummy-namespace",
      gateway_eui: "dummy-gateway",
      received_at: new Date().toISOString(),
      frame_counter: 10,
      channel: 1,
      type: 103,
      name: "temperature",
      value: 24.5,
      id: "dummy-1",
    },
    values: [
      {
        device_id: "dummy-device-1",
        namespace_id: "dummy-namespace",
        gateway_eui: "dummy-gateway",
        received_at: "2026-09-05T10:00:00Z",
        frame_counter: 1,
        channel: 1,
        type: 103,
        name: "temperature",
        value: 21.0,
        id: "dummy-1",
      },
      {
        device_id: "dummy-device-1",
        namespace_id: "dummy-namespace",
        gateway_eui: "dummy-gateway",
        received_at: "2026-09-05T10:05:00Z",
        frame_counter: 2,
        channel: 1,
        type: 103,
        name: "temperature",
        value: 22.5,
        id: "dummy-2",
      },
      {
        device_id: "dummy-device-1",
        namespace_id: "dummy-namespace",
        gateway_eui: "dummy-gateway",
        received_at: "2026-09-05T10:10:00Z",
        frame_counter: 3,
        channel: 1,
        type: 103,
        name: "temperature",
        value: 24.5,
        id: "dummy-3",
      },
      {
        device_id: "dummy-device-1",
        namespace_id: "dummy-namespace",
        gateway_eui: "dummy-gateway",
        received_at: "2026-09-05T10:15:00Z",
        frame_counter: 4,
        channel: 1,
        type: 103,
        name: "temperature",
        value: 23.0,
        id: "dummy-4",
      },
      {
        device_id: "dummy-device-1",
        namespace_id: "dummy-namespace",
        gateway_eui: "dummy-gateway",
        received_at: "2026-09-05T10:20:00Z",
        frame_counter: 5,
        channel: 1,
        type: 103,
        name: "temperature",
        value: 26.0,
        id: "dummy-5",
      },
    ],
  },
]
const metrics = ref(dummyMetrics)
*/
</script>

<template>
  <div class="namespace-page">
    <!-- Header -->
    <AppHeader
      :title="`${namespace?.name || 'Namespace'}⌄`"
      :back="true"
      @back="handleBack"
    >
      <div class="header-actions">
        <button
          class="button small"
          type="button"
          @click="logout"
        >
          ログアウト
        </button>
      </div>
    </AppHeader>

    <!-- Error -->
    <ErrorBanner :errors="errors" />

    <!-- Loading -->
    <section
      v-if="loading"
      class="loading-state"
    >
      <p>読み込み中…</p>
    </section>

    <template v-else-if="namespace">
      <!-- Toolbar -->
      <div class="toolbar">
        <span>
          {{ devices.length }} Device /
          {{ metrics.length }} Metrics
        </span>

        <div class="toolbar-actions">
          <button
            v-if="canManage"
            class="button secondary small"
            type="button"
            @click="handleMembers"
          >
            ユーザー
          </button>

          <button
            v-if="canManage"
            class="button secondary small"
            type="button"
            @click="handleAddDevice"
          >
            ＋ Device
          </button>
        </div>
      </div>

      <!-- Metrics -->
      <article
        v-for="metric in metrics"
        :key="`${metric.latest.device_id}:${metric.latest.channel}:${metric.latest.name}`"
        class="metric-card"
      >
        <div>
          <div class="metric-title">
            {{ getMetricLabel(metric.latest.name) }}
            <span v-if="getMetricUnit(metric.latest.name)">
              ({{ getMetricUnit(metric.latest.name) }})
            </span>
          </div>

          <div class="metric-value">
            {{ formatValue(metric.latest.value) }}
            <span class="metric-unit">
              {{ getMetricUnit(metric.latest.name) }}
            </span>
          </div>

          <div class="metric-meta">
            <span class="device-eui">
              {{
                getDevice(metric.latest)?.dev_eui ||
                getDevice(metric.latest)?.name ||
                "Device"
              }}
            </span>
            -
            {{ formatAgo(metric.latest.received_at) }}
          </div>
        </div>

        <div
          v-if="sparkline(metric.values)"
          class="sparkline"
          v-html="sparkline(metric.values)"
        />

        <span class="chevron">›</span>
      </article>
      
      <!-- Empty -->
      <section
        v-if="!metrics.length"
        class="empty-state"
      >
        <div>
          <h2>計測データがありません</h2>

          <p>
            DeviceからCayenne LPP uplinkを送信すると、
            ここに表示されます。
          </p>

          <button
            v-if="canManage"
            class="button"
            type="button"
            @click="handleAddDevice"
          >
            Deviceを追加
          </button>
        </div>
      </section>
    </template>
  </div>
</template>