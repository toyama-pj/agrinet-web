<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const {
  namespace,
  devices,
  metrics,
  busy,
  errors,
  toastMessage,
  canManage,
  loadNamespace,
  formatValue,
  getMetricLabel,
  getMetricUnit,
  getDevice,
} = useNamespace()

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
  const padding = 2

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
</script>

<template>
  <div class="namespace-page">
    <!-- Header -->
    <header class="header">
      <div class="header-main">
        <button
          class="button secondary small"
          type="button"
          @click="handleBack"
        >
          ← 戻る
        </button>

        <h1>
          {{ namespace?.name || "Namespace" }}
        </h1>
      </div>

      <div class="header-actions">
        <button
          class="button small"
          type="button"
          @click="handleBack"
        >
          ダッシュボード
        </button>
      </div>
    </header>

    <!-- Error -->
    <div
      v-if="errors.length"
      class="error-banner"
    >
      <p
        v-for="(error, index) in errors"
        :key="index"
      >
        {{ error }}
      </p>
    </div>

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
      <div
        v-if="metrics.length"
        class="metrics"
      >
        <article
          v-for="metric in metrics"
          :key="`${metric.latest.device_id}:${metric.latest.channel}:${metric.latest.name}`"
          class="metric-card"
        >
          <div class="metric-card-header">
            <div>
              <h2>
                {{ getMetricLabel(metric.latest.name) }}
              </h2>

              <small>
                {{
                  getDevice(metric.latest)?.name ||
                  getDevice(metric.latest)?.dev_eui ||
                  "Device"
                }}
              </small>
            </div>

            <span class="metric-unit">
              {{ getMetricUnit(metric.latest.name) }}
            </span>
          </div>

          <div class="metric-value">
            {{ formatValue(metric.latest.value) }}
            <span>
              {{ getMetricUnit(metric.latest.name) }}
            </span>
          </div>

          <div class="metric-card-footer">
            <small>
              {{ formatAgo(metric.latest.received_at) }}
            </small>
          </div>

          <div
            v-if="sparkline(metric.values)"
            class="sparkline"
            v-html="sparkline(metric.values)"
          />
        </article>
      </div>

      <!-- Empty -->
      <section
        v-else
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

    <!-- Toast -->
    <div
      v-if="toastMessage"
      class="toast"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>