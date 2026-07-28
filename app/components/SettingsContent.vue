<script setup lang="ts">

const selectedSetting = useSelectedSetting()
const selectedNamespace = useSelectedNamespace()
const {
  namespacePermission,
  loading,
  loadError,
  loadNamespaces
} = useLoadNamespacePermission()

await loadNamespaces()
const namespaces = useNamespaces(namespacePermission.value)
</script>

<template>
  <div class="content">

    <!-- アカウント -->
    <Account v-if="selectedSetting === 'account'" />

    <!-- 子機関係 -->
    <template v-else>

      <section class="header-card">

        <h2>名前空間管理</h2>

        <div class="selector">

          <label>選択中の名前空間</label>

          <template v-if="loading">

            <p class="message">
              読み込み中...
            </p>

          </template>

          <template v-else-if="namespacePermission.length === 0">

            <p class="message">
              アクセス可能な名前空間がありません。
            </p>

          </template>

          <template v-else>

            <select v-model="selectedNamespace">

              <option
                v-for="namespace in namespaces"
                :key="namespace.id"
                :value="namespace.id"
              >
                {{ namespace.displayName }}
              </option>

            </select>

          </template>

        </div>

      </section>

      <Namespace
        v-if="selectedSetting === 'namespace'"
      />

      <Handset
        v-if="selectedSetting === 'handset'"
      />

      <Member
        v-else-if="selectedSetting === 'member'"
      />

    </template>

  </div>
</template>

<style scoped>
.content {
  width: 100%;
  height: 100%;

  padding: 12px;

  overflow-y: auto;

  box-sizing: border-box;
}

.header-card {
  background: white;

  padding: 24px;

  margin-bottom: 12px;

  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
}

.header-card h2 {
  margin: 0 0 20px;
}

.selector {
  display: flex;
  flex-direction: column;

  gap: 8px;
}

.selector label {
  font-weight: bold;
}

.selector select {
  width: 320px;

  padding: 10px 12px;

  border: 1px solid #ccc;

  border-radius: 6px;

  font-size: 15px;
}

.message {
  margin: 0;
  color: #666;
}
</style>