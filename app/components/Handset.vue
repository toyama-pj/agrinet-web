<script setup lang="ts">

const selectedNamespaceId = useSelectedNamespace()

const {
  namespacePermission,
  loadNamespaces
} = useLoadNamespacePermission()

await loadNamespaces()

const selectedNamespace = computed(() => {
  return namespacePermission.value.find(
    x => x.namespace_id === selectedNamespaceId.value
  )
})

/*
 * 後でAPI取得に置き換える
 */
const devices = ref([
  {
    devEUI: "70B3D57ED006A001",
    status: "接続中"
  },
  {
    devEUI: "70B3D57ED006A002",
    status: "未接続"
  }
])

function addDevice() {
  console.log("子機追加")
}

function removeDevice(devEUI: string) {
  console.log("削除", devEUI)
}
</script>

<template>
  <section
    v-if="selectedNamespace"
    class="card"
  >

    <div class="header">

      <h2>子機一覧</h2>

      <button @click="addDevice">
        ＋ 子機を追加
      </button>

    </div>


    <div
      v-if="devices.length === 0"
      class="empty"
    >
      子機は登録されていません。
    </div>


    <div
      v-for="(device,index) in devices"
      :key="device.devEUI"
      class="device-card"
    >

      <h3>
        子機{{ index + 1 }}
      </h3>

      <div class="device-info">

        <div>

          <label>DevEUI</label>

          <input
            :value="device.devEUI"
            readonly
          >

        </div>

        <div>

          <label>状態</label>

          <input
            :value="device.status"
            readonly
          >

        </div>

      </div>

      <div class="actions">

        <button
          class="delete"
          @click="removeDevice(device.devEUI)"
        >
          削除
        </button>

      </div>

    </div>

  </section>

</template>

<style scoped>
.card {
  background: white;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,.08);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h2 {
  margin: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

label {
  margin-bottom: 6px;
  font-weight: bold;
}

input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

input:read-only {
  background: #f5f5f5;
}

.device-card {
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.device-card h3 {
  margin: 0 0 16px;
}

.device-info {
  display: flex;
  gap: 20px;
}

.device-info > div {
  flex: 1;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

button {
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  background: #4f7cff;
  color: white;
  cursor: pointer;
}

button:hover {
  opacity: .9;
}

.delete {
  background: #d9534f;
}

.empty {
  padding: 24px;
  text-align: center;
  color: #666;
}
</style>