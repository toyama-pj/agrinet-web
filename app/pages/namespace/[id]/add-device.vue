<script setup lang="ts">
import type { AddDeviceForm } from "~/types/device"

const route = useRoute()
const router = useRouter()

const {
  busy,
  errors,
  toastMessage,
  addDevice,
} = useAddDevice()

const namespaceId = computed(() => {
  return String(route.params.id)
})

const form = reactive<AddDeviceForm>({
  name: "",
  dev_eui: "",
  dev_addr: "",
  app_s_key: "",
  nwk_s_key: "",
})

async function handleSubmit() {
  const device = await addDevice(
    namespaceId.value,
    form,
  )

  if (device) {
    await router.push(
      `/namespace/${namespaceId.value}`,
    )
  }
}

async function handleBack() {
  await router.push(
    `/namespace/${namespaceId.value}`,
  )
}
</script>

<template>
  <div class="add-device-page">
    <header class="header">
      <div class="header-main">
        <button
          class="button secondary small"
          type="button"
          @click="handleBack"
        >
          ← 戻る
        </button>

        <h1>Device を追加</h1>
      </div>
    </header>

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

    <section class="form-card">
      <form
        class="form-grid"
        @submit.prevent="handleSubmit"
      >
        <div class="field">
          <label for="device-name">
            表示名
          </label>

          <input
            id="device-name"
            v-model="form.name"
            maxlength="100"
            placeholder="Greenhouse Sensor"
            required
          />
        </div>

        <div class="field">
          <label for="dev-eui">
            DevEUI
          </label>

          <input
            id="dev-eui"
            v-model="form.dev_eui"
            autocomplete="off"
            maxlength="16"
            pattern="[0-9a-fA-F]{16}"
            placeholder="0102030405060708"
            required
          />
        </div>

        <div class="field">
          <label for="dev-addr">
            DevAddr
          </label>

          <input
            id="dev-addr"
            v-model="form.dev_addr"
            autocomplete="off"
            maxlength="8"
            pattern="[0-9a-fA-F]{8}"
            placeholder="26011BDA"
            required
          />
        </div>

        <div class="field">
          <label for="app-key">
            AppSKey
          </label>

          <input
            id="app-key"
            v-model="form.app_s_key"
            type="password"
            autocomplete="new-password"
            maxlength="32"
            pattern="[0-9a-fA-F]{32}"
            required
          />
        </div>

        <div class="field">
          <label for="nwk-key">
            NwkSKey
          </label>

          <input
            id="nwk-key"
            v-model="form.nwk_s_key"
            type="password"
            autocomplete="new-password"
            maxlength="32"
            pattern="[0-9a-fA-F]{32}"
            required
          />

          <small>
            キーは暗号化して保存され、画面やログには再表示されません。
          </small>
        </div>

        <button
          class="button full"
          type="submit"
          :disabled="busy"
        >
          {{ busy ? "追加中…" : "Deviceを追加" }}
        </button>
      </form>
    </section>

    <div
      v-if="toastMessage"
      class="toast"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>