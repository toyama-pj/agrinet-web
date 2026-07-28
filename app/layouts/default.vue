<template>
  <div class="layout">
    <header class="header">
      <AppHeader />
    </header>

    <AppBody>
      <slot />
    </AppBody>
  </div>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  background: lightgray;
  overflow: hidden;
}

.layout {
  display: flex;
  flex-direction: column;
  width: calc(100dvw - 20px);
  height: calc(100dvh - 20px);
  margin: 10px;
  border: 1px solid;
  border-radius: 10px;
  overflow: hidden;
}

.header {
  flex-shrink: 0;
}
</style>