<script setup lang="ts">
import type { Namespace } from "~/types/namespace"

const router = useRouter()
const userInfo = useUserInfo()

const {
  namespaces,
  busy,
  errors,
  toastMessage,
  loadNamespaces,
  createDefaultNamespace,
} = useDashboard()

const { logout } = useAuth()

const name = computed(() => {
  return userInfo.value?.Name || "あなた"
})

async function handleOpenNamespace(namespace: Namespace) {
  await router.push(`/namespace/${namespace.namespace_id}`)
}

async function handleCreateNamespace() {
  await createDefaultNamespace()
}

async function handleLogout() {
  await logout()
}

async function handleSettings() {
  await router.push("/settings")
}

onMounted(async () => {
  await loadNamespaces()
})
</script>

<template>
  <div class="dashboard">
    <header class="header">
      <h1>{{ name }} の Device / Namespace</h1>

      <div class="header-actions">
        <button
          class="button secondary small"
          type="button"
          @click="handleSettings"
        >
          設定
        </button>

        <button
          class="button small"
          type="button"
          :disabled="busy"
          @click="handleLogout"
        >
          ログアウト
        </button>
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

    <div
      v-if="namespaces.length"
      class="namespace-list"
    >
      <button
        v-for="namespace in namespaces"
        :key="namespace.namespace_id"
        class="list-row namespace-row"
        type="button"
        @click="handleOpenNamespace(namespace)"
      >
        <strong>
          {{ namespace.name || "Namespace" }}
        </strong>

        <span class="list-meta">
          データなし
        </span>

        <span class="chevron">
          ›
        </span>
      </button>
    </div>

    <section
      v-else
      class="empty-state"
    >
      <div>
        <h2>Namespace がありません</h2>

        <p>
          最初のNamespaceとPersonal Organizationを作成して、Deviceを登録しましょう。
        </p>

        <button
          class="button"
          type="button"
          :disabled="busy"
          @click="handleCreateNamespace"
        >
          {{ busy ? "作成中…" : "Namespaceを作成" }}
        </button>
      </div>
    </section>

    <div
      v-if="toastMessage"
      class="toast"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>