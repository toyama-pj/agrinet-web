<script setup lang="ts">
defineProps<{
  errors: string[]
}>()
</script>

<template>
  <div v-if="errors.length" class="alert" role="alert">
    {{ errors.length }} 件のエラーがあります

    <div class="alert-detail">
      {{ errors.at(-1) }}
    </div>
  </div>
</template>