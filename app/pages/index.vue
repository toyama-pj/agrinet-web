<script setup lang="ts">
definePageMeta({
  layout: false
})
await navigateTo('/login')
</script>

<template>
  <div class="loading">
    <p>ログイン画面へ移動しています...</p>
  </div>
</template>
