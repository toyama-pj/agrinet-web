<script setup lang="ts">
const currentTab = useCurrentTab()
</script>

<template>
  <DashboardContent
    v-if="currentTab === 'dashboard'"
  />

  <SettingsContent
    v-else-if="currentTab === 'settings'"
  />
</template>