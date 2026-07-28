<script setup lang="ts">
import type { KeyValueResponsePayload } from "~/types/data"

const props = defineProps<{
  data: KeyValueResponsePayload | null
  loading: boolean
}>()

function latestValue(item: { values: { value: string }[] }) {
  if (item.values.length === 0) {
    return null
  }

  return item.values[item.values.length - 1]
}

function displayName(key: string) {
  switch (key) {
    case "temperature":
      return "気温"

    case "humidity":
      return "湿度"

    case "soil_moisture":
      return "土壌湿度"

    default:
      return key
  }
}

function unit(key: string) {
  switch (key) {
    case "temperature":
      return "℃"

    case "humidity":
      return "%"

    case "soil_moisture":
      return "%"

    default:
      return ""
  }
}

const latestTime = computed(() => {
  if (!props.data) {
    return null
  }

  let latest = 0

  for (const sensor of props.data.data) {
    const value = sensor.values.at(-1)

    if (value && value.time > latest) {
      latest = value.time
    }
  }

  return latest || null
})
</script>

<template>
  <div class="card">

    <div v-if="loading">
      読み込み中...
    </div>

    <div v-else-if="!data">
      データがありません
    </div>

    <div v-else class="current-data">

      <div class="item">
        <div class="label">更新時刻</div>

        <div class="value">
            {{
            latestTime
                ? new Date(latestTime * 1000).toLocaleTimeString()
                : "-"
            }}
        </div>
      </div>

      <div
        v-for="item in data.data"
        :key="item.key"
        class="item"
      >
        <div class="label">
          {{ displayName(item.key) }}
        </div>

        <div class="value">
          {{ latestValue(item)?.value }}{{ unit(item.key) }}
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
.card {
  background: white;
  padding: 20px;
}

.current-data {
  display: flex;
  gap: 20px;
}

.item {
  flex: 1;

  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  color: gray;
  font-size: 0.9rem;
}

.value {
  margin-top: 6px;
  font-size: 1.8rem;
  font-weight: bold;
}
</style>