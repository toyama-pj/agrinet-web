<script setup lang="ts">
const { apiFetch } = useApi()

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

const creating = ref(false)

async function createNamespace() {

  creating.value = true

  try {

    const result =
      await apiFetch<{
        namespace_id: string
      }>(
        "/cfg/me/namespace/create",
        {
          method: "POST"
        }
      )

    await loadNamespaces()

    selectedNamespaceId.value =
      result.namespace_id

  } catch (e) {

    console.error(e)

  } finally {

    creating.value = false

  }

}
</script>

<template>

  <!-- 名前空間情報 -->

  <section class="card">

    <h2>名前空間情報</h2>

    <template v-if="selectedNamespace">

      <div class="form-group">

        <label>ID</label>

        <input
          :value="selectedNamespace.namespace_id"
          readonly
        >

      </div>

      <div class="form-group">

        <label>あなたの権限</label>

        <input
          :value="selectedNamespace.grant_type"
          readonly
        >

      </div>

    </template>

    <p v-else>
      名前空間が選択されていません
    </p>

  </section>



  <!-- 新しい名前空間 -->

  <section class="card">

    <h2>新しい名前空間</h2>

    <p class="description">
      新しい名前空間を作成します。
    </p>

    <div class="actions">

      <button
        :disabled="creating"
        @click="createNamespace"
      >
        {{ creating ? "作成中..." : "＋ 名前空間を追加" }}
      </button>

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

.description {
  color: #666;
  margin-bottom: 20px;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

button {
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  background: #4f7cff;
  color: white;
  cursor: pointer;
}

button:hover:not(:disabled) {
  opacity: .9;
}

button:disabled {
  opacity: .6;
  cursor: default;
}
</style>