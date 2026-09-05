<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string
    back?: boolean
  }>(),
  {
    back: false,
  },
)

const emit = defineEmits<{
  back: []
}>()
</script>

<template>
  <header class="app-header">
    <div>
      <button
        v-if="props.back"
        class="icon-button back-button"
        type="button"
        aria-label="戻る"
        @click="emit('back')"
      >
        ‹
      </button>
    </div>

    <h1>{{ props.title }}</h1>

    <div class="header-actions">
      <slot />
    </div>
  </header>
</template>