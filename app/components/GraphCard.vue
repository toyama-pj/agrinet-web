<script setup lang="ts">
import type { KeyValueResponsePayload } from "~/types/data"

import VChart from "vue-echarts"

import { use } from "echarts/core"

import {
  LineChart
} from "echarts/charts"

import {
  GridComponent,
  TooltipComponent,
  TitleComponent
} from "echarts/components"

import {
  CanvasRenderer
} from "echarts/renderers"

use([
  LineChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  CanvasRenderer
])

const props = defineProps<{
  data: KeyValueResponsePayload | null
  loading: boolean
}>()

const selectedRange = defineModel<string>("range")

const selectedKey = ref("temperature")

function sensorName(key: string) {
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

const sensorList = computed(() => {
  if (!props.data) {
    return []
  }

  return props.data.data.map(sensor => ({
    key: sensor.key,
    label: sensorName(sensor.key)
  }))
})

watch(
  sensorList,
  list => {
    const first = list[0]

    if (
      first &&
      !list.some(sensor => sensor.key === selectedKey.value)
    ) {
      selectedKey.value = first.key
    }
  },
  {
    immediate: true
  }
)

const graphData = computed(() => {
  if (!props.data) {
    return []
  }

  const sensor = props.data.data.find(
    sensor => sensor.key === selectedKey.value
  )

  if (!sensor) {
    return []
  }

  return sensor.values.map(value => ({
    time: new Date(
      value.time * 1000
    ).toLocaleTimeString(),

    value: Number(value.value)
  }))
})

const option = computed(() => ({
  title: {
    text: sensorName(selectedKey.value)
  },

  tooltip: {
    trigger: "axis"
  },

  xAxis: {
    type: "category",
    data: graphData.value.map(x => x.time)
  },

  yAxis: {
    type: "value"
  },

  series: [
    {
      type: "line",
      data: graphData.value.map(x => x.value),
      smooth: true
    }
  ]
}))

const ranges = [
  {
    id: "1h",
    label: "1時間"
  },
  {
    id: "6h",
    label: "6時間"
  },
  {
    id: "24h",
    label: "24時間"
  },
  {
    id: "7d",
    label: "7日"
  }
]

const statistics = computed(() => {
  if (graphData.value.length === 0) {
    return null
  }

  const values = graphData.value.map(
    x => x.value
  )

  return {
    max: Math.max(...values),

    min: Math.min(...values),

    average:
      values.reduce(
        (sum, value) => sum + value,
        0
      ) / values.length
  }
})
</script>

<template>
  <div class="graph-card">

    <div v-if="loading">
      読み込み中...
    </div>

    <div v-else-if="!data">
      データがありません
    </div>

    <template v-else>

      <div class="toolbar">

        <div>
          <label>表示項目</label>

          <select v-model="selectedKey">
            <option
              v-for="sensor in sensorList"
              :key="sensor.key"
              :value="sensor.key"
            >
              {{ sensor.label }}
            </option>
          </select>
        </div>

        <div>
          <label>表示期間</label>

          <select v-model="selectedRange">
            <option
              v-for="range in ranges"
              :key="range.id"
              :value="range.id"
            >
              {{ range.label }}
            </option>
          </select>
        </div>

      </div>

      <VChart
        class="graph"
        :option="option"
        autoresize
      />

    </template>
    <div
      v-if="statistics"
      class="statistics"
    >
      <div class="item">
        <div class="label">最大値</div>
        <div class="value">
          {{ statistics.max.toFixed(1) }}
        </div>
      </div>

      <div class="item">
        <div class="label">平均値</div>
        <div class="value">
          {{ statistics.average.toFixed(1) }}
        </div>
      </div>

      <div class="item">
        <div class="label">最小値</div>
        <div class="value">
          {{ statistics.min.toFixed(1) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.graph-card {
  display: flex;
  flex-direction: column;

  height: 100%;

  background: white;
  padding: 16px;
}

.toolbar {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.toolbar > div {
  display: flex;
  align-items: center;
  gap: 8px;
}

.graph {
  flex: 1;
  width: 100%;
  min-height: 0;
}

.statistics {
  flex-shrink: 0;

  display: flex;
  justify-content: space-evenly;

  margin-top: 16px;
  padding-top: 12px;

  border-top: 1px solid #ddd;
}

.item {
  flex: 1;
  text-align: center;
}

.label {
  color: #666;
  font-size: 0.9rem;
}

.value {
  margin-top: 6px;
  font-size: 1.5rem;
  font-weight: bold;
}
</style>